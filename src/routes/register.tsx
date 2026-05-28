import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: form.full_name, phone: form.phone } }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng ký thành công, vui lòng đăng nhập");
    nav({ to: "/login" });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-6 h-6 text-green-700"/></div>
            <h1 className="mt-3 text-2xl font-bold text-green-900">Đăng ký</h1>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[{k:"full_name",l:"Họ và tên",t:"text"},{k:"email",l:"Email",t:"email"},{k:"phone",l:"Số điện thoại",t:"tel"},{k:"password",l:"Mật khẩu",t:"password"}].map(f=>(
              <div key={f.k}>
                <label className="text-sm font-medium">{f.l}</label>
                <input type={f.t} required value={(form as any)[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500"/>
              </div>
            ))}
            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium disabled:opacity-50">{loading?"Đang xử lý...":"Đăng ký"}</button>
          </form>
          <div className="text-center text-sm mt-4 text-gray-600">Đã có tài khoản? <Link to="/login" className="text-green-700 font-medium hover:underline">Đăng nhập</Link></div>
        </div>
      </div>
    </SiteLayout>
  );
}
