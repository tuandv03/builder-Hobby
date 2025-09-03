import { useState } from "react";

interface SellerInfo {
  sellerName: string;
  price: number;
  condition: string;
}

export default function CardPrice() {
  const [idProduct, setIdProduct] = useState("");
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrice = async () => {
    setLoading(true);
    setError("");
    setSellers([]);
    try {
      // Chuẩn RESTful: GET /api/card-price?game=3&product={idProduct}
    
  const url = "https://www.cardmarket.com/en/YuGiOh/Products/Singles/Justice-Hunters/Dracotail-Arthalion-V1-Ultra-Rare";
  const res = await fetch(`http://localhost:3000/scrape?url=${encodeURIComponent(url)}`);

      if (!res.ok) throw new Error("Không lấy được dữ liệu!");
      const data = await res.json();
      // Giả sử service trả về mảng sellers
      // [{ sellerName, price, condition }, ...]
      setSellers(data.sellers || []);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Card Price Lookup</h1>
      <div className="flex gap-2 my-2">
        <input
          className="border p-2"
          placeholder="Enter idProduct"
          value={idProduct}
          onChange={(e) => setIdProduct(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={fetchPrice}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Price"}
        </button>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      {sellers.length > 0 && (
        <div className="mt-4">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Seller Name</th>
                <th className="border px-2 py-1 text-left">Price</th>
                <th className="border px-2 py-1 text-left">Condition</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{seller.sellerName}</td>
                  <td className="border px-2 py-1">{seller.price}</td>
                  <td className="border px-2 py-1">{seller.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-blue-500">Đang tải dữ liệu...</div>
      )}
    </div>
  );
}
