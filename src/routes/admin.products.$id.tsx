import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/$id")({ component: ProductForm });

function ProductForm() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const [form, setForm] = useState<any>({ name: "", description: "", price: 0, stock_quantity: 0, image_url: "", category_id: "", status: "active" });
  const { data: cats = [] } = useQuery({ queryKey: ["cats"], queryFn: async ()=>(await supabase.from("categories").select("*").order("name")).data || [] });

  useEffect(() => {
    if (!isNew) supabase.from("products").select("*").eq("id", id).maybeSingle().then(({ data }) => { if (data) setForm(data); });
  }, [id, isNew]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, description: form.description, price: Number(form.price), stock_quantity: Number(form.stock_quantity), image_url: form.image_url, category_id: form.category_id || null, status: form.status };
    if (isNew) {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) return toast.error(error.message);
    }
    toast.success("Đã lưu");
    nav({ to: "/admin/products" });
  };

  return (
    <AdminLayout>
      <Link to="/admin/products" className="text-green-700 text-sm">← Quay lại</Link>
      <h1 className="text-2xl font-bold text-green-900 my-4">{isNew ? "Thêm sản phẩm" : "Chỉnh sửa sản phẩm"}</h1>
      <form onSubmit={save} className="bg-white rounded-xl border border-green-100 p-6 space-y-4 max-w-2xl">
        <div><label className="text-sm font-medium">Tên sản phẩm</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
        <div><label className="text-sm font-medium">Mô tả</label><textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} rows={4} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Giá (VND)</label><input type="number" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
          <div><label className="text-sm font-medium">Tồn kho</label><input type="number" required value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
        </div>
        <div><label className="text-sm font-medium">Danh mục</label>
          <select value={form.category_id||""} onChange={e=>setForm({...form,category_id:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200">
            <option value="">-- Chọn --</option>
            {cats.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-medium">URL ảnh</label><input value={form.image_url||""} onChange={e=>setForm({...form,image_url:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
        <div><label className="text-sm font-medium">Trạng thái</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200">
            <option value="active">Hiển thị</option><option value="hidden">Ẩn</option>
          </select>
        </div>
        <button className="bg-green-600 text-white px-6 py-2 rounded-md">Lưu</button>
      </form>
    </AdminLayout>
  );
}
