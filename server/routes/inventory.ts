import { RequestHandler } from "express";

// Simple in-memory store (non-persistent). For persistence, connect a DB MCP like Neon/Supabase.
// Key format: `${cardId}::${rarity}` where rarity is a string like "Ultra Rare" or "N/A" when missing
const inventoryStore: Record<string, number> = {};

export const getInventory: RequestHandler = (_req, res) => {
  res.json({ inventory: inventoryStore });
};

export const updateInventory: RequestHandler = (req, res) => {
  const { updates } = req.body as { updates?: Record<string, unknown> };

  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Invalid updates payload" });
  }

  const applied: Record<string, number> = {};
  for (const [key, value] of Object.entries(updates)) {
    const keyStr = String(key);
    const qtyNum =
      typeof value === "string" ? Number(value) : (value as number);

    if (!keyStr || typeof keyStr !== "string") continue;
    if (!Number.isFinite(qtyNum) || qtyNum < 0) continue;

    const quantity = Math.floor(qtyNum);
    inventoryStore[keyStr] = quantity;
    applied[keyStr] = quantity;
  }

  res.json({ success: true, inventory: inventoryStore, applied });
};
