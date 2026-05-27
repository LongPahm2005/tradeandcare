import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { formatVND } from "@/lib/format";
import { Edit, Trash2, EyeOff, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({ component: ProductsAdmin });

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })).data || [],
  });
  const toggle = async (p: any) => {
    const { error } = await supabase.from("products").update({ status: p.status === "active" ? "hidden" : "active" }).eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa sản phẩm?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">Quản lý sản phẩm</h1>
        <Link to="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1"><Plus className="w-4 h-4"/>Thêm sản phẩm</Link>
      </div>
      <div className="bg-white rounded-xl border border-green-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50"><tr><th className="text-left p-3">Ảnh</th><th className="text-left p-3">Tên</th><th className="text-left p-3">Danh mục</th><th className="text-left p-3">Giá</th><th className="text-left p-3">Tồn</th><th className="text-left p-3">Trạng thái</th><th className="p-3"></th></tr></thead>
          <tbody>{items.map((p:any)=>(
            <tr key={p.id} className="border-t">
              <td className="p-3"><img src={p.image_url} alt="" className="w-12 h-12 rounded object-cover"/></td>
              <td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.categories?.name}</td>
              <td className="p-3">{formatVND(Number(p.price))}</td><td className="p-3">{p.stock_quantity}</td>
              <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{p.status==="active"?"Hiển thị":"Ẩn"}</span></td>
              <td className="p-3 text-right space-x-2">
                <button onClick={()=>toggle(p)} className="text-yellow-600">{p.status==="active"?<EyeOff className="w-4 h-4 inline"/>:<Eye className="w-4 h-4 inline"/>}</button>
                <Link to="/admin/products/$id" params={{id:p.id}} className="text-blue-600"><Edit className="w-4 h-4 inline"/></Link>
                <button onClick={()=>remove(p.id)} className="text-red-600"><Trash2 className="w-4 h-4 inline"/></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
