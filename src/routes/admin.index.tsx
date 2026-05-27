import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { formatVND } from "@/lib/format";
import { Package, ShoppingBag, Users, DollarSign, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, o, u, lowStock, recent, revenue] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id,name,stock_quantity").lte("stock_quantity", 10).order("stock_quantity").limit(5),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("orders").select("total_amount").eq("status", "hoan_thanh"),
      ]);
      return {
        products: p.count || 0,
        orders: o.count || 0,
        users: u.count || 0,
        revenue: (revenue.data || []).reduce((s,x:any)=>s+Number(x.total_amount),0),
        lowStock: lowStock.data || [],
        recent: recent.data || [],
      };
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-green-900 mb-6">Tổng quan</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{i:Package,l:"Sản phẩm",v:stats?.products ?? "-"},{i:ShoppingBag,l:"Đơn hàng",v:stats?.orders ?? "-"},{i:Users,l:"Người dùng",v:stats?.users ?? "-"},{i:DollarSign,l:"Doanh thu",v:stats?formatVND(stats.revenue):"-"}].map((s,i)=>(
          <div key={i} className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
            <s.i className="w-8 h-8 text-green-600"/>
            <div className="mt-2 text-sm text-gray-500">{s.l}</div>
            <div className="text-2xl font-bold">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-600"/>Sản phẩm sắp hết hàng</h2>
          {stats?.lowStock.length === 0 ? <div className="text-sm text-gray-500">Không có</div> : (
            <ul className="divide-y">
              {stats?.lowStock.map((p:any)=>(<li key={p.id} className="py-2 flex justify-between text-sm"><span>{p.name}</span><span className="font-semibold text-red-600">{p.stock_quantity}</span></li>))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-5">
          <h2 className="font-semibold mb-3">Đơn hàng gần đây</h2>
          {stats?.recent.length === 0 ? <div className="text-sm text-gray-500">Chưa có</div> : (
            <ul className="divide-y">
              {stats?.recent.map((o:any)=>(<li key={o.id} className="py-2 flex justify-between text-sm"><span>{o.receiver_name}</span><span className="font-semibold">{formatVND(Number(o.total_amount))}</span></li>))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
