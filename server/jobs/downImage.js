const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===============
// Config
// ===============
const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php"; // full DB
// const API_URL = "https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Blue-Eyes"; // archetype riêng

const IMG_DIR = path.join(process.cwd(), "images");
const IMG_DIR_SMALL = path.join(process.cwd(), "images_small");
const IMG_DIR_CROPPED = path.join(process.cwd(), "images_cropped");

// Tạo folder nếu chưa có
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}
if (!fs.existsSync(IMG_DIR_SMALL)) {
  fs.mkdirSync(IMG_DIR_SMALL, { recursive: true });
}
if (!fs.existsSync(IMG_DIR_CROPPED)) {
  fs.mkdirSync(IMG_DIR_CROPPED, { recursive: true });
}
// ===============
// Download helper
// ===============
async function downloadImage(url, filepath) {
  const writer = fs.createWriteStream(filepath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// ===============
// Main
// ===============
async function main() {
  console.log("🔄 Fetching card data...");
  const res = await axios.get(API_URL);
  const cards = res.data.data;

  for (const card of cards) {
    if (card.card_images) {
      for (const [idx, img] of card.card_images.entries()) {
        const url = img.image_url;
        const url_small = img.image_url_small;
        const url_cropped = img.image_url_cropped;
        const ext = path.extname(url).split("?")[0] || ".jpg";
        const safeName = card.name.replace(/["<>:/\\|?*]+/g, "").trim();

        const filename = `${safeName}_${img.id}${ext}`;
        const filepath = path.join(IMG_DIR, filename);
        const filepathSmall = path.join(IMG_DIR_SMALL, filename);
        const filepathCropped = path.join(IMG_DIR_CROPPED, filename);
        const imageList = [
          {
            url: url,
            filepath: filepath,
          },
          {
            url: url_small,
            filepath: filepathSmall,
          },
          {
            url: url_cropped,
            filepath: filepathCropped,
          },
        ];
        if (!fs.existsSync(filepath)) { 
          try {
            console.log(`⬇️ Downloading ${filename}`);
            await downloadImage(url, filepath);
            await downloadImage(url_small, filepathSmall);
            await downloadImage(url_cropped, filepathCropped);
          } catch (err) {
            console.error(`❌ Error downloading ${url}`, err.message);
          }
        } else {
          console.log(`✅ Already exists: ${filename}`);
        }
      }
    }
  }

  console.log("🎉 All images downloaded!");
}

main();
