import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/admin/diseases")({
  component: () => (
    <AdminLayout>
      <CrudTable
        table="plant_diseases"
        title="Quản lý bệnh cây"
        fields={[
          { key: "symptom", label: "Triệu chứng" },
          { key: "disease_name", label: "Tên bệnh" },
          { key: "cause", label: "Nguyên nhân", type: "textarea" },
          { key: "solution", label: "Giải pháp", type: "textarea" },
          { key: "suggested_product_type", label: "Sản phẩm gợi ý" },
          { key: "image_url", label: "Ảnh URL" },
        ]}
        listColumns={["symptom", "disease_name"]}
      />
    </AdminLayout>
  ),
});
