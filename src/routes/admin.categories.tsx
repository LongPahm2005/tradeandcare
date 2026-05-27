import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Edit } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: Categories });

function Categories() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const { data: items = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data || [],
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      const { error } = await supabase.from("categories").update({ name: form.name, description: form.description }).eq("id", form.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("categories").insert({ name: form.name, description: form.description });
      if (error) return toast.error(error.message);
    }
    toast.success("Đã lưu");
    setForm({ id: "", name: "", description: "" });
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Xóa danh mục?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-green-900 mb-6">Quản lý danh mục</h1>
      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <form onSubmit={save} className="bg-white rounded-xl border border-green-100 p-4 space-y-3 h-fit">
          <div><label className="text-sm font-medium">Tên</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
          <div><label className="text-sm font-medium">Mô tả</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/></div>
          <div className="flex gap-2"><button className="flex-1 bg-green-600 text-white py-2 rounded-md">{form.id?"Cập nhật":"Thêm"}</button>
            {form.id && <button type="button" onClick={()=>setForm({id:"",name:"",description:""})} className="px-3 py-2 border rounded-md">Hủy</button>}
          </div>
        </form>
        <div className="bg-white rounded-xl border border-green-100">
          <table className="w-full text-sm">
            <thead className="bg-green-50"><tr><th className="text-left p-3">Tên</th><th className="text-left p-3">Mô tả</th><th className="p-3"></th></tr></thead>
            <tbody>{items.map((c:any)=>(
              <tr key={c.id} className="border-t"><td className="p-3 font-medium">{c.name}</td><td className="p-3 text-gray-600">{c.description}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={()=>setForm({id:c.id,name:c.name,description:c.description||""})} className="text-blue-600"><Edit className="w-4 h-4 inline"/></button>
                  <button onClick={()=>remove(c.id)} className="text-red-600"><Trash2 className="w-4 h-4 inline"/></button>
                </td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
