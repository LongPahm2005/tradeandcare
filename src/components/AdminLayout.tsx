import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Users, Tag, Package, ShoppingBag, BookOpen, Bug, Home, Sparkles } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;
  if (!user) return <div className="p-10 text-center">Vui lòng <Link to="/login" className="text-green-700 underline">đăng nhập</Link>.</div>;
  if (!isAdmin) return <div className="p-10 text-center">Bạn không có quyền truy cập trang quản trị.</div>;

  const links = [
    { to: "/admin", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/categories", label: "Danh mục", icon: Tag },
    { to: "/admin/products", label: "Sản phẩm", icon: Package },
    { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
    { to: "/admin/care", label: "Chăm sóc cây", icon: BookOpen },
    { to: "/admin/diseases", label: "Bệnh cây", icon: Bug },
    { to: "/admin/chatbot-settings", label: "Cấu hình AI", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex bg-green-50/30">
      <aside className="w-60 bg-white border-r border-green-100 hidden md:block">
        <div className="p-4 font-bold text-green-700 border-b border-green-100">Quản trị</div>
        <nav className="p-2 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/admin" }} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-green-50 [&.active]:bg-green-100 [&.active]:text-green-800">
              <l.icon className="w-4 h-4"/>{l.label}
            </Link>
          ))}
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 mt-4 border-t pt-4">
            <Home className="w-4 h-4"/>Về trang chính
          </Link>
        </nav>
      </aside>
      <div className="flex-1">
        <div className="md:hidden bg-white border-b p-3 overflow-x-auto whitespace-nowrap flex gap-2">
          {links.map(l => <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/admin" }} className="inline-block px-3 py-1.5 rounded-md text-xs bg-green-50 [&.active]:bg-green-600 [&.active]:text-white">{l.label}</Link>)}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
