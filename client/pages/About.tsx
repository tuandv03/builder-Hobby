import Layout from "@/components/Layout";
import { useState, useRef } from "react";

// Cấu hình Firebase (thay bằng config thật của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyC08rnWt7r7areapTZFVH_TIN-VRxT5-AU",
  authDomain: "orderworker-b8f00.firebaseapp.com",
  projectId: "orderworker-b8f00",
  storageBucket: "orderworker-b8f00.firebasestorage.app",
  messagingSenderId: "996067939631",
  appId: "1:996067939631:web:0264ea508941042d4abdda",
  measurementId: "G-S0D5BVWQ0B"
};

interface OrderData {
  orderDetails: string;
  cusName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  rawText: string;
}

export default function About() {
  const [data, setData] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pushed, setPushed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateFile, setTemplateFile] = useState<ArrayBuffer | null>(null);
  const [message, setMessage] = useState(null);

  // Đọc file template khi người dùng chọn
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTemplateFile(evt.target?.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  async function getData() {
    if (data) {
      setLoading(true);
      await postDataToGooleApi();
      setLoading(false);
    }
  }

  async function postDataToGooleApi() {
    const apiKey = "AIzaSyBpYzuqBn-IxJpHxd-dfgpXq6QxXStB3dg"; // Thay bằng API key thật
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const payload = {
      contents: [
        {
          parts: [
            {
              text:
                " Định dạng nội dung sau thành các trường Tên, địa chỉ, số điện thoại; không viết tắt, cách nhau bằng kí tự @@ và chỉ trả về nội dung cần thiết, đúng format" +
                data,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const orderObj: Partial<OrderData> = {};
      orderObj.rawText = text;
      var arr = text.split("@@");
      orderObj.cusName = arr[0]?.replace("Tên:", "").trim();
      orderObj.address = arr[1]?.replace("Địa chỉ:", "").trim();
      orderObj.phoneNumber = arr[2]?.replace("Số điện thoại:", "").trim();
      
      orderObj.orderDetails = data;
      setOrder(orderObj as OrderData);
      setPushed(false);
    } else {
      console.error("Failed to call Gemini API");
    }
  }

  // Hàm lưu đơn hàng vào file Excel
async function saveOrderToExcel(order: OrderData) {
  const res = await fetch("http://localhost:3001/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      cusName: order.cusName, 
      phoneNumber: order.phoneNumber, 
      address: order.address 
    })
  });
  
    const result = await res.json();

    if (res.ok) {
      setMessage({ type: "success", text: "Đơn hàng đã gửi thành công!" });
      setOrder(result);
    } else {
      setMessage({ type: "error", text: result.message || "Có lỗi xảy ra" });
    }
  }
  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-10">       
        <label
          className="block mb-2 font-semibold text-gray-700"
          htmlFor="order-input"
        >
          Nhập thông tin đơn hàng
        </label>
        <textarea
          id="order-input"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Nhập tên, địa chỉ, số điện thoại, tỉnh, huyện, phường..."
          className="w-full h-40 p-4 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
        ></textarea>
        <button
          type="button"
          className="mt-4 w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl shadow hover:from-blue-600 hover:to-blue-800 transition"
          onClick={getData}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Gửi đơn hàng"}
        </button>
        {loading && (
          <div className="mt-4 text-blue-500 text-center animate-pulse">
            Đang gửi yêu cầu, vui lòng chờ...
          </div>
        )}
        {order && !loading && (
          <div className="mt-8 p-6 border-2 border-green-300 rounded-xl bg-green-50 shadow">
            <h3 className="font-bold text-lg mb-4 text-green-700">
              Thông tin đơn hàng
            </h3>
            <div className="mb-2">
              <span className="font-semibold">Tên:</span> {order.cusName}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Địa chỉ:</span> {order.address}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Số điện thoại:</span>{" "}
              {order.phoneNumber}
            </div>
            {/* <div className="mb-2">
              <span className="font-semibold">Tỉnh:</span> {order.province}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Huyện:</span> {order.district}
            </div> */}
            <div className="mb-2">
              {/* <span className="font-semibold">Phường:</span> {order.ward} */}
            </div>
            {!pushed && (
              <button
                className="mt-6 w-full px-6 py-2 bg-green-500 text-white font-semibold rounded-xl shadow hover:bg-green-600 transition"
                onClick={() => {
                  saveOrderToExcel(order);
                 // setPushed(true);
                }}
              >
                Xác nhận
              </button>
            )}
            {pushed && (
              <div className="mt-4 text-green-600 text-center font-semibold">
                Đã gửi thành công!
              </div>
            )}
            {message && (
              <div
                className={`mt-4 p-4 rounded-xl text-center font-semibold ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

          </div>
        )}
      </div>
    </Layout>
  );
}
