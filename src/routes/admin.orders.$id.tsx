import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { formatVND, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/format";

export const Route = createFileRoute("/admin/orders/$id")({ component: AdminOrderDetail });

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const { data: order } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => (await supabase.from("orders").select("*, order_details(*, products(name, image_url))").eq("id", id).maybeSingle()).data,
  });

  if (!order) return <AdminLayout><div>Đang tải...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Link to="/admin/orders" className="text-green-700 text-sm">← Quay lại</Link>
      <h1 className="text-2xl font-bold mt-2 text-green-900">Đơn hàng #{order.id.slice(0,8)}</h1>
      <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</div>
      <div className="mt-4 bg-white rounded-xl border border-green-100 p-4 grid sm:grid-cols-2 gap-3 text-sm">
        <div><b>Người nhận:</b> {order.receiver_name}</div><div><b>SĐT:</b> {order.phone}</div>
        <div className="sm:col-span-2"><b>Địa chỉ:</b> {order.address}</div>
        {order.note && <div className="sm:col-span-2"><b>Ghi chú:</b> {order.note}</div>}
      </div>
      <div className="mt-4 bg-white rounded-xl border border-green-100">
        <div className="p-4 font-semibold border-b">Sản phẩm</div>
        {order.order_details?.map((d:any)=>(
          <div key={d.id} className="p-4 flex items-center gap-3 border-b last:border-0">
            {d.products?.image_url && <img src={d.products.image_url} alt="" className="w-14 h-14 rounded object-cover"/>}
            <div className="flex-1"><div className="font-medium">{d.products?.name}</div><div className="text-sm text-gray-500">{d.quantity} x {formatVND(Number(d.unit_price))}</div></div>
            <div className="font-semibold">{formatVND(Number(d.subtotal))}</div>
          </div>
        ))}
        <div className="p-4 flex justify-between font-bold text-green-700"><span>Tổng cộng</span><span>{formatVND(Number(order.total_amount))}</span></div>
      </div>
    </AdminLayout>
  );
}
