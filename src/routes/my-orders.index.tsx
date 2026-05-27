import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatVND, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/format";

export const Route = createFileRoute("/my-orders/")({ component: MyOrders });

function MyOrders() {
  const { user, loading: aLoad } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data || [],
  });

  if (aLoad) return <SiteLayout><div className="p-10 text-center">Đang tải...</div></SiteLayout>;
  if (!user) return <SiteLayout><div className="p-10 text-center">Vui lòng <Link to="/login" className="text-green-700 underline">đăng nhập</Link>.</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-green-900 mb-6">Đơn hàng của tôi</h1>
        {isLoading ? <div>Đang tải...</div> : orders.length === 0 ? <div className="text-gray-500">Chưa có đơn hàng nào.</div> : (
          <div className="space-y-3">
            {orders.map((o:any)=>(
              <Link key={o.id} to="/my-orders/$id" params={{ id: o.id }} className="block bg-white rounded-xl border border-green-100 p-4 hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono text-xs text-gray-500">#{o.id.slice(0,8)}</div>
                    <div className="font-semibold mt-1">{o.receiver_name}</div>
                    <div className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-2 py-1 rounded-full text-xs ${ORDER_STATUS_COLOR[o.status]}`}>{ORDER_STATUS_LABEL[o.status]}</div>
                    <div className="font-bold text-green-700 mt-1">{formatVND(Number(o.total_amount))}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
