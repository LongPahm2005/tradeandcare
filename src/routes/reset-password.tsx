import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { toast } from "sonner";
import { Leaf, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hashValid, setHashValid] = useState<boolean | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token=")) {
      setHashValid(true);
    } else {
      setHashValid(false);
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    if (password.length < 6) {
      return toast.error("Mật khẩu tối thiểu 6 ký tự");
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    setDone(true);
    toast.success("Đặt lại mật khẩu thành công");
  };

  if (hashValid === false) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center">
            <h1 className="text-xl font-bold text-green-900">Link không hợp lệ</h1>
            <p className="text-sm text-gray-500 mt-2">Link khôi phục mật khẩu đã hết hạn hoặc không đúng.</p>
            <Link to="/forgot-password" className="inline-block mt-4 text-green-700 font-medium hover:underline">Yêu cầu link mới</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-6 h-6 text-green-700"/></div>
            <h1 className="mt-3 text-2xl font-bold text-green-900">Đặt lại mật khẩu</h1>
            <p className="text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản</p>
          </div>
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700">Mật khẩu đã được cập nhật thành công.</p>
              <Link to="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium">Đăng nhập ngay</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <input type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-green-200 focus:outline-none focus:border-green-500" />
              </div>
              <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-medium disabled:opacity-50">{loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}</button>
            </form>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
