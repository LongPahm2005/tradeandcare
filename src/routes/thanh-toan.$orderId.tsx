import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatVND } from "@/lib/format";
import { CheckCircle2, Truck, Landmark, Copy, ShoppingBag, ListOrdered } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/thanh-toan/$orderId")({ component: PaymentPage });

const BANK_INFO = {
  bank: "Vietcombank",
  account_number: "0123456789",
  account_name: "TRADE AND CARE PLANTS",
  branch: "Chi nhánh Hà Nội",
};

function PaymentPage() {
  const { orderId } = Route.useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_details(*, products(name, image_url))")
        .eq("id", orderId)
        .maybeSingle();
      return data;
    },
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  if (isLoading)
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">Đang tải...</div>
      </SiteLayout>
    );
  if (!order)
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">Không tìm thấy đơn hàng.</div>
      </SiteLayout>
    );

  const transferContent = `TTPL ${order.id.slice(0, 8).toUpperCase()}`;
  const qrUrl = `https://img.vietqr.io/image/VCB-${BANK_INFO.account_number}-compact2.png?amount=${order.total_amount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(BANK_INFO.account_name)}`;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
          <h1 className="mt-3 text-2xl font-bold text-green-900">Đặt hàng thành công!</h1>
          <p className="text-gray-600 text-sm mt-1">
            Mã đơn hàng: <span className="font-mono font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-green-100 shadow-sm p-6">
          <h2 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
            {order.payment_method === "cod" ? (
              <>
                <Truck className="w-5 h-5" /> Thanh toán khi nhận hàng (COD)
              </>
            ) : (
              <>
                <Landmark className="w-5 h-5" /> Chuyển khoản ngân hàng
              </>
            )}
          </h2>

          {order.payment_method === "cod" ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p>Đơn hàng của bạn sẽ được giao đến địa chỉ:</p>
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="font-medium">{order.receiver_name} • {order.phone}</div>
                <div className="text-gray-600">{order.address}</div>
              </div>
              <p>
                Vui lòng chuẩn bị số tiền <span className="font-bold text-green-700">{formatVND(Number(order.total_amount))}</span> để
                thanh toán cho nhân viên giao hàng.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[200px_1fr] gap-6 items-start">
              <div className="bg-white border border-green-100 rounded-xl p-2 mx-auto">
                <img src={qrUrl} alt="QR chuyển khoản" className="w-44 h-44 object-contain" />
                <div className="text-center text-xs text-gray-500 mt-1">Quét QR để chuyển khoản</div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { l: "Ngân hàng", v: BANK_INFO.bank },
                  { l: "Số tài khoản", v: BANK_INFO.account_number, copy: true },
                  { l: "Chủ tài khoản", v: BANK_INFO.account_name },
                  { l: "Chi nhánh", v: BANK_INFO.branch },
                  { l: "Số tiền", v: formatVND(Number(order.total_amount)), highlight: true, copy: true, raw: String(order.total_amount) },
                  { l: "Nội dung CK", v: transferContent, highlight: true, copy: true },
                ].map((it: any) => (
                  <div key={it.l} className="flex items-center justify-between gap-2 py-1.5 border-b border-green-50 last:border-0">
                    <span className="text-gray-500">{it.l}</span>
                    <div className="flex items-center gap-2">
                      <span className={it.highlight ? "font-bold text-green-700" : "font-medium"}>{it.v}</span>
                      {it.copy && (
                        <button
                          type="button"
                          onClick={() => copy(it.raw || it.v, it.l)}
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          aria-label={`Sao chép ${it.l}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                  Vui lòng ghi đúng <b>Nội dung chuyển khoản</b> để đơn hàng được xác nhận nhanh chóng.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/my-orders"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            <ListOrdered className="w-4 h-4" /> Xem đơn hàng của tôi
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-green-200 text-green-700 hover:bg-green-50 rounded-lg font-medium"
          >
            <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
