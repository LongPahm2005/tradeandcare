import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { formatVND, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/")({ component: OrdersAdmin });

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data || [],
  });
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-green-900 mb-6">Quản lý đơn hàng</h1>
      <div className="bg-white rounded-xl border border-green-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-green-50"><tr><th className="text-left p-3">Mã</th><th className="text-left p-3">Người nhận</th><th className="text-left p-3">SĐT</th><th className="text-left p-3">Tổng</th><th className="text-left p-3">Trạng thái</th><th className="text-left p-3">Ngày</th><th className="p-3"></th></tr></thead>
          <tbody>{orders.map((o:any)=>(
            <tr key={o.id} className="border-t">
              <td className="p-3 font-mono text-xs">#{o.id.slice(0,8)}</td><td className="p-3">{o.receiver_name}</td><td className="p-3">{o.phone}</td>
              <td className="p-3 font-semibold">{formatVND(Number(o.total_amount))}</td>
              <td className="p-3">
                <select value={o.status} onChange={e=>update(o.id,e.target.value)} className={`px-2 py-1 rounded text-xs ${ORDER_STATUS_COLOR[o.status]}`}>
                  {Object.entries(ORDER_STATUS_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </td>
              <td className="p-3">{new Date(o.created_at).toLocaleDateString("vi-VN")}</td>
              <td className="p-3 text-right"><Link to="/admin/orders/$id" params={{id:o.id}} className="text-green-700 text-sm">Xem</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
