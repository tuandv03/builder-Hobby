const express = require("express");
const { json } = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const credentials = require("./credentials.json");
const app = express();
const PORT = 3002;

// Google Sheets config
const SHEET_ID = "1hvoE16iwPeiAihZiUo3pzNootBsoyUDP2IFr2HoCBVQ"; // Thay bằng ID Google Sheet của bạn
const SHEET_RANGE = "CARD_LIST!A2:E"; // Giả sử dữ liệu ở cột A: mã, B: tên, C: số lượng


const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

app.use(cors());
app.use(json());

// API đọc danh sách card
app.get("/api/cards", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    const rows = result.data.values || [];
    const cards = rows.map(row => ({
      code: row[0] || "",
      name: row[1] || "",
      quantity: Number(row[2] || 0),
    }));
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Không đọc được dữ liệu Google Sheet", details: err.message });
  }
});

// API ghi card mới hoặc cập nhật số lượng
app.post("/api/cards/add", async (req, res) => {
  const { code, name, quantity } = req.body;
  if (!code || !name || !quantity) {
    return res.status(400).json({ error: "Thiếu thông tin card!" });
  }
  try {
    // Đọc dữ liệu hiện tại
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
    });
    const rows = result.data.values || [];
    let found = false;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === code) {
        // Nếu trùng code, cộng số lượng
        rows[i][2] = String(Number(rows[i][2] || 0) + quantity);
        found = true;
        break;
      }
    }
    if (!found) {
      // Nếu chưa có, thêm dòng mới
      rows.push([code, name, String(quantity)]);
    }
    // Ghi lại toàn bộ sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Không ghi được dữ liệu Google Sheet", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Card API server running at http://localhost:${PORT}`);
});