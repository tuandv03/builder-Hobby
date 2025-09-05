import { writeFileSync } from "fs";
import { get } from "https";

const url = "https://provinces.open-api.vn/api/v1/?depth=3";

get(url, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const provinces = JSON.parse(data);

      let csv = "Province,District,Ward\n";

      provinces.forEach((province) => {
        const provinceName = province.name;
        province.districts.forEach((district) => {
          const districtName = district.name;
          district.wards.forEach((ward) => {
            const wardName = ward.name;
            csv += `"${provinceName}","${districtName}","${wardName}"\n`;
          });
        });
      });

      writeFileSync("vn_provinces.csv", csv, "utf8");
      console.log("✅ File vn_provinces.csv đã được tạo thành công!");
    } catch (err) {
      console.error("❌ Lỗi parse JSON:", err.message);
    }
  });
}).on("error", (err) => {
  console.error("❌ Lỗi gọi API:", err.message);
});
