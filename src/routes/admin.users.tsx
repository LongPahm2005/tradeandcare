import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles || []).map((p:any) => ({ ...p, roles: (roles||[]).filter((r:any)=>r.user_id===p.id).map((r:any)=>r.role) }));
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-green-900 mb-6">Quản lý người dùng</h1>
      <div className="bg-white rounded-xl border border-green-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50">
            <tr><th className="text-left p-3">Họ tên</th><th className="text-left p-3">Email</th><th className="text-left p-3">SĐT</th><th className="text-left p-3">Vai trò</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Ngày tạo</th></tr>
          </thead>
          <tbody>
            {users.map((u:any)=>(
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.full_name || "-"}</td><td className="p-3">{u.email}</td><td className="p-3">{u.phone || "-"}</td>
                <td className="p-3">{u.roles.join(", ") || "customer"}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{u.status}</span></td>
                <td className="p-3">{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
