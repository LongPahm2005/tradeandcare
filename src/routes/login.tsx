import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng nhập thành công");
    nav({ to: "/" });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-6 h-6 text-green-700"/></div>
            <h1 className="mt-3 text-2xl font-bold text-green-900">Đăng nhập</h1>
            <p className="text-sm text-gray-500">Chào mừng quay lại</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500"/>
            </div>
            <div>
              <label className="text-sm font-medium">Mật khẩu</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500"/>
            </div>
            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium disabled:opacity-50">{loading?"Đang đăng nhập...":"Đăng nhập"}</button>
          </form>
          <div className="text-center text-sm mt-4 text-gray-600">Chưa có tài khoản? <Link to="/register" className="text-green-700 font-medium hover:underline">Đăng ký</Link></div>
        </div>
      </div>
    </SiteLayout>
  );
}
