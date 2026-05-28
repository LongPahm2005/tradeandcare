import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { createUser } from "@/lib/admin-users.functions";
import { UserPlus, X } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const qc = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "", role: "customer" as "customer" | "admin" });
  const callCreate = useServerFn(createUser);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles || []).map((p: any) => ({
        ...p,
        roles: (roles || []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await callCreate({ data: form });
      toast.success("Đã thêm người dùng mới!");
      setOpenAdd(false);
      setForm({ email: "", password: "", full_name: "", phone: "", role: "customer" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast.error(e?.message || "Không thể tạo người dùng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-900">Quản lý người dùng</h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="bg-white rounded-xl border border-green-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50">
            <tr>
              <th className="text-left p-3">Họ tên</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">SĐT</th>
              <th className="text-left p-3">Vai trò</th>
              <th className="text-left p-3">Trạng thái</th>
              <th className="text-left p-3">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name || "-"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone || "-"}</td>
                <td className="p-3">{u.roles.join(", ") || "customer"}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{u.status}</span>
                </td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpenAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-900">Thêm người dùng mới</h2>
              <button onClick={() => setOpenAdd(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Họ tên *</label>
                <input required maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200" />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200" />
              </div>
              <div>
                <label className="text-sm font-medium">Mật khẩu * (tối thiểu 6 ký tự)</label>
                <input required type="password" minLength={6} maxLength={100} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200" />
              </div>
              <div>
                <label className="text-sm font-medium">Số điện thoại</label>
                <input type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200" />
              </div>
              <div>
                <label className="text-sm font-medium">Vai trò</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 bg-white">
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpenAdd(false)} className="px-4 py-2 rounded-md border border-gray-200 text-sm cursor-pointer">Hủy</button>
                <button disabled={submitting} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 cursor-pointer">
                  {submitting ? "Đang tạo..." : "Tạo người dùng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
