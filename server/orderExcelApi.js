/**
 * Simple backend API for appending order data to an Excel template.
 * Usage:
 * 1. Start server: node server/orderExcelApi.js
 * 2. POST order data to http://localhost:3001/api/order
 *    Body: { cusName, phoneNumber, address }
 */

import express, { json } from "express";
import ExcelJS from "exceljs";
import { join } from "path";
import cors from "cors";

const app = express();
const PORT = 3001;
const excelFile = "./server/VTP_excel_don_hang.xlsx";

app.use(cors());
app.use(json());

app.get("/check", (req, res) => {
  res.send("Order Excel API is running!");
});

app.post("/api/order", async (req, res) => {
  const { cusName, phoneNumber, address } = req.body;
  if (!cusName && !phoneNumber && !address) {
    return res.status(400).json({ error: "Thiếu dữ liệu đơn hàng!" });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFile);
    const worksheet = workbook.worksheets[0];

    // Tìm dòng đầu tiên mà col C, D, E đều rỗng (bắt đầu từ dòng 9 nếu cần)
    let found = false;
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber >= 9) {
        const c = row.getCell(3).value;
        const d = row.getCell(4).value;
        const e = row.getCell(5).value;
        if (!c && !d && !e) {
          row.getCell(3).value = cusName || "";
          row.getCell(4).value = phoneNumber || "";
          row.getCell(5).value = address || "";
          found = true;
          return false; // Dừng vòng lặp
        }
      }
    });

    // Nếu không có dòng trống, thêm vào cuối
    if (!found) {
      const lastRow = worksheet.lastRow.number + 1;
      const row = worksheet.getRow(lastRow);
      row.getCell(3).value = cusName || "";
      row.getCell(4).value = phoneNumber || "";
      row.getCell(5).value = address || "";
      row.commit();
    }

    await workbook.xlsx.writeFile(excelFile);

    res.json({ success: true, message: "Đã ghi đơn hàng vào file Excel!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi ghi file Excel!", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Order Excel API đang chạy tại http://localhost:${PORT}`);
});
