import type { RequestHandler } from "express";

const YGO_BASE = "https://db.ygoprodeck.com/api/v7" as const;

const withTimeout = async <T>(p: Promise<T>, ms = 10000): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    // @ts-ignore signal available in runtime
    const res: any = await p;
    clearTimeout(timeout);
    return res;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
};

export const getPrice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.query as { id?: string };
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
    const card = (data?.data && data.data[0]) || null;
    if (!card) return res.status(404).json({ error: "Card not found" });

    const price =
      Array.isArray(card.card_prices) && card.card_prices.length > 0
        ? card.card_prices[0]
        : null;
    res.json({
      id: card.id,
      name: card.name,
      image:
        card.card_images?.[0]?.image_url_small ||
        card.card_images?.[0]?.image_url ||
        null,
      prices: price,
    });
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
};
