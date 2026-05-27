import { Link } from "@tanstack/react-router";
import { Leaf, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Trang chủ" },
    { to: "/products", label: "Sản phẩm" },
    { to: "/care", label: "Chăm sóc cây" },
    { to: "/diseases", label: "Tra cứu bệnh cây" },
    { to: "/chatbot", label: "Chatbot tư vấn" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-green-100">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <Leaf className="w-6 h-6" />
          Trade & Care Plants
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-green-50 hover:text-green-700 [&.active]:bg-green-100 [&.active]:text-green-800">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="px-3 py-1.5 text-sm rounded-md bg-green-50 text-green-700 flex items-center gap-1"><ShieldCheck className="w-4 h-4"/>Admin</Link>}
              <Link to="/my-orders" className="px-3 py-1.5 text-sm rounded-md hover:bg-green-50">Đơn hàng</Link>
              <button onClick={signOut} className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-sm rounded-md hover:bg-green-50">Đăng nhập</Link>
              <Link to="/register" className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700">Đăng ký</Link>
            </>
          )}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
      </div>
      {open && (
        <div className="md:hidden border-t border-green-100 bg-white px-4 py-2 space-y-1">
          {links.map(l => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-green-50">{l.label}</Link>)}
          {user ? (
            <>
              {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm bg-green-50 text-green-700">Quản trị</Link>}
              <Link to="/my-orders" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm">Đơn hàng của tôi</Link>
              <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-sm bg-green-600 text-white">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm">Đăng nhập</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md text-sm bg-green-600 text-white">Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
