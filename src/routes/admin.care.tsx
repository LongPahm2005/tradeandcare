import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/admin/care")({
  component: () => (
    <AdminLayout>
      <CrudTable
        table="plant_care_guides"
        title="Quản lý chăm sóc cây"
        fields={[
          { key: "plant_name", label: "Tên cây" },
          { key: "plant_type", label: "Loại cây" },
          { key: "watering", label: "Tưới nước", type: "textarea" },
          { key: "sunlight", label: "Ánh sáng", type: "textarea" },
          { key: "soil", label: "Đất trồng", type: "textarea" },
          { key: "fertilizer", label: "Phân bón", type: "textarea" },
          { key: "note", label: "Lưu ý", type: "textarea" },
          { key: "image_url", label: "Ảnh URL" },
        ]}
        listColumns={["plant_name", "plant_type"]}
      />
    </AdminLayout>
  ),
});
