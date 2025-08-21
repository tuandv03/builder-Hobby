import Layout from "@/components/Layout";
import PlaceholderPage from "@/components/PlaceholderPage";
import { useState } from "react";

export default function Order() {
    const [data,setData] = useState("");
  return (
    <Layout>
      {/* <PlaceholderPage
        title="About DuelMaster"
        description="Learn about our mission to provide the best Yu-Gi-Oh! card shopping experience for duelists worldwide."
      /> */}
      <textarea value ={data} onChange={(e) => setData(e.target.value)}
        placeholder="Enter your order details here"
        className="w-full h-64 p-4 border rounded-lg"></textarea>
        <button type="button" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">
        Submit Order</button>
    </Layout>
    
  );
}
