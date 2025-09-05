import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getInventory, updateInventory } from "./routes/inventory";
import { getCards, getCardById } from "./routes/cards";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Inventory API (in-memory)
  app.get("/api/inventory", getInventory);
  app.post("/api/inventory", updateInventory);

  // Proxy YGO API
  app.get("/api/cards", getCards);
  app.get("/api/card", getCardById);

  return app;
}
