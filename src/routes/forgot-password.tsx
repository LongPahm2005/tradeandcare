import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { Leaf, Mail } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Đã gửi email khôi phục mật khẩu");
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-6 h-6 text-green-700"/></div>
            <h1 className="mt-3 text-2xl font-bold text-green-900">Khôi phục mật khẩu</h1>
            <p className="text-sm text-gray-500">Nhập email để nhận link đặt lại mật khẩu</p>
          </div>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700">Đã gửi email khôi phục đến <strong>{email}</strong>.</p>
              <p className="text-sm text-gray-500">Vui lòng kiểm tra hộp thư (cả thư rác) và click link trong email để đặt lại mật khẩu.</p>
              <Link to="/login" className="inline-block text-green-700 font-medium hover:underline">Quay lại đăng nhập</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500" />
              </div>
              <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium disabled:opacity-50">{loading ? "Đang gửi..." : "Gửi email khôi phục"}</button>
              <div className="text-center text-sm mt-2 text-gray-600">Nhớ mật khẩu rồi? <Link to="/login" className="text-green-700 font-medium hover:underline">Đăng nhập</Link></div>
            </form>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
