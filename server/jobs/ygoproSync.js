const axios = require("axios");
const { Pool } = require("pg");

// =====================
// Config DB PostgreSQL
// =====================
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "yugiohDb",
  password: "1",
  port: 5432,
});

// =====================
// Insert or Update Data
// =====================
async function upsertCard(client, card) {
  // Insert/Update card chính
  await client.query(
    `INSERT INTO Cards (id, name, type, human_readable_type, frame_type, description, race, atk, def, level, attribute, archetype, ygoprodeck_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        human_readable_type = EXCLUDED.human_readable_type,
        frame_type = EXCLUDED.frame_type,
        description = EXCLUDED.description,
        race = EXCLUDED.race,
        atk = EXCLUDED.atk,
        def = EXCLUDED.def,
        level = EXCLUDED.level,
        attribute = EXCLUDED.attribute,
        archetype = EXCLUDED.archetype,
        ygoprodeck_url = EXCLUDED.ygoprodeck_url`,
    [
      card.id,
      card.name,
      card.type || null,
      card.humanReadableCardType || null,
      card.frameType || null,
      card.desc || null,
      card.race || null,
      card.atk || null,
      card.def || null,
      card.level || null,
      card.attribute || null,
      card.archetype || null,
      card.ygoprodeck_url || null,
    ]
  );

  // Clear dữ liệu con trước khi insert lại
  await client.query("DELETE FROM CardSets WHERE card_id = $1", [card.id]);
  await client.query("DELETE FROM CardImages WHERE card_id = $1", [card.id]);
  

  // Insert CardSets
  if (card.card_sets) {
    for (const set of card.card_sets) {
      await client.query(
        `INSERT INTO CardSets (card_id, set_name, set_code, set_rarity, set_rarity_code, set_price)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          card.id,
          set.set_name,
          set.set_code,
          set.set_rarity,
          set.set_rarity_code,
          set.set_price ? parseFloat(set.set_price) : null,
        ]
      );
    }
  }

  // Insert CardImages
  if (card.card_images) {
    for (const img of card.card_images) {
      await client.query(
        `INSERT INTO CardImages (card_id, image_url, image_url_small, image_url_cropped)
         VALUES ($1,$2,$3,$4)`,
        [card.id, img.image_url, img.image_url_small, img.image_url_cropped]
      );
    }
  }

}

// =====================
// Main job
// =====================
async function main() {
  const url =
    "https://db.ygoprodeck.com/api/v7/cardinfo.php";

  console.log("🔄 Fetching data from API...");
  const res = await axios.get(url);
  const cards = res.data.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const card of cards) {
      await upsertCard(client, card);
      //console.log(`✅ Synced card: ${card.name}`);
    }

    await client.query("COMMIT");
    console.log("🎉 Sync completed!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error syncing cards:", err.message);
  } finally {
    client.release();
  }
}

main().then(() => process.exit(0));
