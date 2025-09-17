import { RequestHandler } from "express";
import { queryDb, executeDb } from "../services/serviceBase";

// Lấy inventory từ DB
export const getInventory: RequestHandler = async (req, res) => {
  try {
    const { card_id, id } = req.query as { card_id?: string; id?: string };
    const cardId = id || card_id || null;
    const data = await queryDb(
      `SELECT
         c.set_code,
         c.card_name,
         c.set_rarity AS rarity,
         cs.quantity
       FROM cardinventory cs
       LEFT JOIN cardsets c ON cs.cardset_id = c.id
       WHERE ($1::int IS NULL OR c.card_id = $1)
       ORDER BY c.set_code, c.card_name`,
      [cardId ? Number(cardId) : null],
    );
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: String(err) });
  }
};

// Cập nhật inventory vào DB
export const updateInventory: RequestHandler = async (req, res) => {
  const { updates } = req.body as { updates?: Record<string, unknown> };
  if (!updates || typeof updates !== "object") {
    return res.status(400).json({ error: "Invalid updates payload" });
  }

  const applied: Record<string, number> = {};
  try {
    for (const [key, value] of Object.entries(updates)) {
      const [cardId, rarity = "N/A"] = key.split("::");
      const qtyNum =
        typeof value === "string" ? Number(value) : (value as number);

      if (!cardId || !Number.isFinite(qtyNum) || qtyNum < 0) continue;
      const quantity = Math.floor(qtyNum);

      // Upsert inventory
      await executeDb(
        `INSERT INTO inventory (card_id, rarity, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (card_id, rarity)
         DO UPDATE SET quantity = $3`,
        [cardId, rarity, quantity],
      );
      applied[key] = quantity;
    }
    // Trả về inventory mới
    const rows = await queryDb(
      "SELECT card_id, rarity, quantity FROM inventory",
    );
    const inventory: Record<string, number> = {};
    for (const row of rows) {
      const key = `${row.card_id}::${row.rarity || "N/A"}`;
      inventory[key] = row.quantity;
    }
    res.json({ success: true, inventory, applied });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: String(err) });
  }
};
