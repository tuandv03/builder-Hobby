import type { RequestHandler } from "express";
import { executeDb } from "../services/serviceBase";

// Simple in-memory fallback storage when DB is not configured
const memoryOrders: any[] = [];

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { items } = req.body as {
      items?: Array<{ id: number; qty: number; price?: number }>;
    };
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid items" });
    }

    const now = new Date().toISOString();

    // Attempt to persist to DB if available (tables may not exist; swallow errors)
    try {
      // Create order record
      await executeDb(`INSERT INTO orders(created_at) VALUES ($1)`, [now]);
      // Save each item
      for (const it of items) {
        await executeDb(
          `INSERT INTO order_items(card_id, quantity, price, created_at) VALUES ($1, $2, $3, $4)`,
          [it.id, it.qty, it.price ?? null, now],
        );
      }
      return res.json({ success: true, stored: "db" });
    } catch (_dbErr) {
      // Fallback to memory
      memoryOrders.push({ created_at: now, items });
      return res.json({ success: true, stored: "memory" });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};
