import type { RequestHandler } from "express";
import { queryDb, executeDb } from "../services/serviceBase";
const YGO_BASE = "https://db.ygoprodeck.com/api/v7" as const;

const withTimeout = async <T>(p: Promise<T>, ms = 10000): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    // @ts-ignore Node 18+ global fetch signal supported
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const res: any = await p;
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
};

export const getCards: RequestHandler = async (req, res) => {
  try {
    const params = new URLSearchParams();
    // Forward ALL query params (name, archetype, level, attribute, etc.)
    for (const [k, v] of Object.entries(req.query)) {
      if (Array.isArray(v)) {
        for (const vi of v) params.append(k, String(vi));
      } else if (v != null) {
        params.append(k, String(v));
      }
    }
    const url = `${YGO_BASE}/cardinfo.php${params.size ? `?${params.toString()}` : ""}`;
    const response = await withTimeout(
      fetch(url, { headers: { accept: "application/json" } }),
    );
    if (!response.ok) {
      console.log(url);
      return res
        .status(502)
        .json({ error: "Upstream error", status: response.status });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch cards" });
  }
};

export const getCardById: RequestHandler = async (req, res) => {
  try {
    const {id} = req.query as { id?: string };
    if (!id) return res.status(400).json({ error: "Missing id" });
      const data = await queryDb(`WITH img AS (
    SELECT 
        c2.card_id,
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'image_url', c2.image_url,
                'image_url_small', c2.image_url_small
            )
        ) AS card_images
    FROM cardimages c2
    GROUP BY c2.card_id
    ORDER BY c2.image_id
),
sets AS (
    SELECT 
        c3.card_id,
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'set_name', c3.set_name,
                'card_code', c3.card_code,
                'set_rarity', c3.set_rarity
            )
        ) AS card_sets
    FROM cardsets c3
    GROUP BY c3.card_id
    ORDER BY c3.set_id, c3.set_rarity_code
)
SELECT 
    c.id,
    c."name",
    c."type",
    c.human_readable_type,
    c.description desc,
    c.race,
    c.atk,
    c.def,
    c."level",
    c."attribute",
    c.archetype,
    c.frame_type,
    img.card_images,
    sets.card_sets
  FROM cards c
  LEFT JOIN img ON img.card_id = c.id
  LEFT JOIN sets ON sets.card_id = c.id
  WHERE c.id = $1; `, [id]
      );         
  
      res.json({data});
  } catch (err) {
    res.status(502).json({ error:  String(err) });
  }
};
