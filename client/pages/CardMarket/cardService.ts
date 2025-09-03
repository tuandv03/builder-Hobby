const fs = window.require ? window.require("fs") : null;
const filePath = "https://docs.google.com/spreadsheets/d/1hvoE16iwPeiAihZiUo3pzNootBsoyUDP2IFr2HoCBVQ/edit?gid=0#gid=0";

export type CardDb = { code: string; name: string; quantity: number };

export async function readCardFile(): Promise<CardDb[]> {
  const url = "https://docs.google.com/spreadsheets/d/1hvoE16iwPeiAihZiUo3pzNootBsoyUDP2IFr2HoCBVQ/export?format=csv&gid=0";
  const res = await fetch(url);
  const text = await res.text();

  return text.split("\n").slice(1).map(line => {
    const [code, name, quantity] = line.split(",");
    return { code, name, quantity: Number(quantity) || 0 };
  });
}

export function writeCardFile(cardList: CardDb[]) {
  if (!fs) return;
  try {
    fs.writeFileSync(filePath, JSON.stringify(cardList, null, 2), "utf8");
    console.log("Ghi file thành công:", filePath);
  } catch (err) {
    console.error("Lỗi ghi file:", err);
  }
}