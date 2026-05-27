import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Edit, Plus, X } from "lucide-react";

type Field = { key: string; label: string; type?: "text" | "textarea" | "number" };

export function CrudTable({ table, title, fields, listColumns }: { table: string; title: string; fields: Field[]; listColumns: string[] }) {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from(table as any).select("*").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    fields.forEach(f => { payload[f.key] = f.type === "number" ? Number(editing[f.key] || 0) : (editing[f.key] || null); });
    if (editing.id) {
      const { error } = await supabase.from(table as any).update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from(table as any).insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success("Đã lưu");
    setEditing(null);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Xác nhận xóa?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-900">{title}</h1>
        <button onClick={()=>setEditing({})} className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1"><Plus className="w-4 h-4"/>Thêm</button>
      </div>
      <div className="bg-white rounded-xl border border-green-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50"><tr>{listColumns.map(c=><th key={c} className="text-left p-3">{fields.find(f=>f.key===c)?.label||c}</th>)}<th className="p-3"></th></tr></thead>
          <tbody>{rows.map(r=>(
            <tr key={r.id} className="border-t">
              {listColumns.map(c=><td key={c} className="p-3 max-w-xs truncate">{r[c]}</td>)}
              <td className="p-3 text-right space-x-2">
                <button onClick={()=>setEditing(r)} className="text-blue-600"><Edit className="w-4 h-4 inline"/></button>
                <button onClick={()=>remove(r.id)} className="text-red-600"><Trash2 className="w-4 h-4 inline"/></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setEditing(null)}>
          <form onSubmit={save} onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-3">
            <div className="flex justify-between items-center"><h2 className="font-bold text-lg">{editing.id ? "Sửa" : "Thêm mới"}</h2><button type="button" onClick={()=>setEditing(null)}><X className="w-5 h-5"/></button></div>
            {fields.map(f=>(
              <div key={f.key}>
                <label className="text-sm font-medium">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea value={editing[f.key]||""} onChange={e=>setEditing({...editing,[f.key]:e.target.value})} rows={3} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/>
                ) : (
                  <input type={f.type==="number"?"number":"text"} value={editing[f.key]||""} onChange={e=>setEditing({...editing,[f.key]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"/>
                )}
              </div>
            ))}
            <button className="w-full bg-green-600 text-white py-2 rounded-md">Lưu</button>
          </form>
        </div>
      )}
    </div>
  );
}
