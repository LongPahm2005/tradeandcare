import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { createUser, updateUser, deleteUser } from "@/lib/admin-users.functions";
import { UserPlus, X, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type EditState = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  status: "active" | "inactive";
  role: "customer" | "admin";
  password: string;
};

function UsersPage() {
  const qc = useQueryClient();
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "customer" as "customer" | "admin",
  });

  const callCreate = useServerFn(createUser);
  const callUpdate = useServerFn(updateUser);
  const callDelete = useServerFn(deleteUser);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles || []).map((p: any) => ({
        ...p,
        roles: (roles || []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
      }));
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await callCreate({ data: form });
      toast.success("Đã thêm người dùng mới!");
      setOpenAdd(false);
      setForm({ email: "", password: "", full_name: "", phone: "", role: "customer" });
      refresh();
    } catch (e: any) {
      toast.error(e?.message || "Không thể tạo người dùng");
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      await callUpdate({
        data: {
          id: editing.id,
          full_name: editing.full_name,
          phone: editing.phone,
          status: editing.status,
          role: editing.role,
          password: editing.password || undefined,
        },
      });
      toast.success("Đã cập nhật người dùng!");
      setEditing(null);
      refresh();
    } catch (e: any) {
      toast.error(e?.message || "Không thể cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await callDelete({ data: { id: deleting.id } });
      toast.success("Đã xóa người dùng!");
      setDeleting(null);
      refresh();
    } catch (e: any) {
      toast.error(e?.message || "Không thể xóa");
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
              <th className="text-right p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const role = u.roles.includes("admin") ? "admin" : "customer";
              return (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.full_name || "-"}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {role === "admin" ? "Quản trị" : "Khách hàng"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.status === "active" ? "Hoạt động" : "Khóa"}
                    </span>
                  </td>
                  <td className="p-3">{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          setEditing({
                            id: u.id,
                            email: u.email,
                            full_name: u.full_name || "",
                            phone: u.phone || "",
                            status: (u.status as any) || "active",
                            role,
                            password: "",
                          })
                        }
                        className="p-1.5 rounded-md hover:bg-green-50 text-green-700 cursor-pointer"
                        title="Sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting({ id: u.id, name: u.full_name || u.email })}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-600 cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      {openAdd && (
        <Modal title="Thêm người dùng mới" onClose={() => setOpenAdd(false)}>
          <form onSubmit={submitCreate} className="space-y-3">
            <Field label="Họ tên *">
              <input required maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Email *">
              <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Mật khẩu * (tối thiểu 6 ký tự)">
              <input required type="password" minLength={6} maxLength={100} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Số điện thoại">
              <input type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Vai trò">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className={`${inputCls} bg-white`}>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </Field>
            <FormActions onCancel={() => setOpenAdd(false)} submitting={submitting} submitLabel="Tạo người dùng" />
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title="Sửa người dùng" onClose={() => setEditing(null)}>
          <form onSubmit={submitEdit} className="space-y-3">
            <Field label="Email">
              <input disabled value={editing.email} className={`${inputCls} bg-gray-50 text-gray-500`} />
            </Field>
            <Field label="Họ tên *">
              <input required maxLength={100} value={editing.full_name} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Số điện thoại">
              <input type="tel" maxLength={20} value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vai trò">
                <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as any })} className={`${inputCls} bg-white`}>
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </Field>
              <Field label="Trạng thái">
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })} className={`${inputCls} bg-white`}>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Khóa</option>
                </select>
              </Field>
            </div>
            <Field label="Mật khẩu mới (để trống nếu không đổi)">
              <input type="password" minLength={6} maxLength={100} value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className={inputCls} />
            </Field>
            <FormActions onCancel={() => setEditing(null)} submitting={submitting} submitLabel="Lưu thay đổi" />
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Xác nhận xóa" onClose={() => setDeleting(null)}>
          <p className="text-sm text-gray-700 mb-4">
            Bạn có chắc muốn xóa người dùng <b>{deleting.name}</b>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-md border border-gray-200 text-sm cursor-pointer">Hủy</button>
            <button onClick={confirmDelete} disabled={submitting} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50 cursor-pointer">
              {submitting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

const inputCls = "mt-1 w-full px-3 py-2 rounded-md border border-green-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-green-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormActions({ onCancel, submitting, submitLabel }: { onCancel: () => void; submitting: boolean; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-gray-200 text-sm cursor-pointer">Hủy</button>
      <button disabled={submitting} className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 cursor-pointer">
        {submitting ? "Đang lưu..." : submitLabel}
      </button>
    </div>
  );
}
