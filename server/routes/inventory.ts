import { RequestHandler } from "express";

// Simple in-memory store (non-persistent). For persistence, connect a DB MCP like Neon/Supabase.
const inventoryStore: Record<number, number> = {};

export const getInventory: RequestHandler = (_req, res) => {
  res.json({ inventory: inventoryStore });
};

export const updateInventory: RequestHandler = (req, res) => {
  const { updates } = req.body as { updates?: Record<string | number, unknown> };

  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Invalid updates payload" });
  }

  const applied: Record<number, number> = {};
  for (const [key, value] of Object.entries(updates)) {
    const id = Number(key);
    const qtyNum = typeof value === "string" ? Number(value) : (value as number);

    if (!Number.isFinite(id) || id <= 0) continue;
    if (!Number.isFinite(qtyNum) || qtyNum < 0) continue;

    const quantity = Math.floor(qtyNum);
    inventoryStore[id] = quantity;
    applied[id] = quantity;
  }

  res.json({ success: true, inventory: inventoryStore, applied });
};
