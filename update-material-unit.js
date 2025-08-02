// สคริปต์สำหรับอัปเดตหน่วยของแป้งข้าวเหนียวในฐานข้อมูล
// ใช้งาน: node update-material-unit.js

const API_BASE_URL = "http://localhost:8000/api"

async function updateMaterialUnit() {
  try {
    const response = await fetch(`${API_BASE_URL}/materials/update-unit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer hardcodedtoken123"
      },
      body: JSON.stringify({
        materialName: "แป้งข้าวเหนียว",
        newUnit: "กรัม"
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log("✅ อัปเดตหน่วยของแป้งข้าวเหนียวสำเร็จ:", result.message)
    } else {
      console.error("❌ ไม่สามารถอัปเดตหน่วยได้:", result.error)
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message)
  }
}

// รันสคริปต์
updateMaterialUnit() 