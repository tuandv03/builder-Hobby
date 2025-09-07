import { RequestHandler } from "express";
import { queryDb, executeDb } from "../services/serviceBase";

// Lấy inventory từ DB
export const getInventory: RequestHandler = async (_req, res) => {
  try {
   // console.log("Fetching inventory from DB");
    const data = await queryDb(`SELECT  c.card_code , c.card_name,c.set_rarity_code 
             ,c.set_rarity   ,cs.quantity ,c.card_name||'_'||c.card_id AS card_url
            FROM  cardinventory cs
            LEFT JOIN cardsets c ON cs.cardset_id = c.id  
            where c.set_code = 'RA04' AND c.set_rarity LIKE 'Qua%'
            ORDER BY  c.set_rarity_code,c.card_name `);
    // Trả về dạng object: { "cardId::rarity": quantity }
    const inventory: Record<string, number> = {};
    console.log("Inventory rows:", data.length);
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
        [cardId, rarity, quantity]
      );
      applied[key] = quantity;
    }
    // Trả về inventory mới
    const rows = await queryDb("SELECT card_id, rarity, quantity FROM inventory");
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
