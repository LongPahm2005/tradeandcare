import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { CrudTable } from "@/components/CrudTable";

export const Route = createFileRoute("/admin/chatbot")({
  component: () => (
    <AdminLayout>
      <CrudTable
        table="chatbot_responses"
        title="Quản lý chatbot"
        fields={[
          { key: "keyword", label: "Từ khóa" },
          { key: "question_sample", label: "Câu hỏi mẫu" },
          { key: "response", label: "Trả lời", type: "textarea" },
          { key: "suggested_product_type", label: "Sản phẩm gợi ý" },
        ]}
        listColumns={["keyword", "question_sample"]}
      />
    </AdminLayout>
  ),
});
