import type { RequestHandler } from "express";

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
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "Missing id" });
    const url = `${YGO_BASE}/cardinfo.php?id=${encodeURIComponent(id)}`;
    const response = await withTimeout(
      fetch(url, { headers: { accept: "application/json" } }),
    );
    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "Upstream error", status: response.status });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch card" });
  }
};
