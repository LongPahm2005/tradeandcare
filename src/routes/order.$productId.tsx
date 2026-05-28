import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatVND } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Truck, Landmark } from "lucide-react";

export const Route = createFileRoute("/order/$productId")({ component: OrderPage });

function OrderPage() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    receiver_name: "",
    phone: "",
    address: "",
    note: "",
    quantity: 1,
    payment_method: "cod" as "cod" | "bank_transfer",
  });
  const [loading, setLoading] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => (await supabase.from("products").select("*").eq("id", productId).maybeSingle()).data,
  });

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data) setForm((f) => ({ ...f, receiver_name: data.full_name || "", phone: data.phone || "" }));
      });
    }
  }, [user]);

  if (!user)
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          Vui lòng <Link to="/login" className="text-green-700 underline">đăng nhập</Link> để đặt hàng.
        </div>
      </SiteLayout>
    );
  if (!product)
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center">Đang tải...</div>
      </SiteLayout>
    );

  const total = Number(product.price) * form.quantity;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        receiver_name: form.receiver_name,
        phone: form.phone,
        address: form.address,
        note: form.note,
        total_amount: total,
        payment_method: form.payment_method,
      })
      .select()
      .single();
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    const { error: e2 } = await supabase.from("order_details").insert({
      order_id: order.id,
      product_id: product.id,
      quantity: form.quantity,
      unit_price: product.price,
      subtotal: total,
    });
    setLoading(false);
    if (e2) return toast.error(e2.message);
    toast.success("Đặt hàng thành công!");
    nav({ to: "/thanh-toan/$orderId", params: { orderId: order.id } });
  };

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-green-900 mb-6">Đặt hàng</h1>
        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <form onSubmit={submit} className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm space-y-4">
            {[
              { k: "receiver_name", l: "Tên người nhận", t: "text" },
              { k: "phone", l: "Số điện thoại", t: "tel" },
              { k: "address", l: "Địa chỉ", t: "text" },
            ].map((f) => (
              <div key={f.k}>
                <label className="text-sm font-medium">{f.l}</label>
                <input
                  required
                  type={f.t}
                  value={(form as any)[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Số lượng</label>
              <input
                type="number"
                min={1}
                max={product.stock_quantity}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-md border border-green-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Phương thức thanh toán</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { v: "cod", l: "Thanh toán khi nhận hàng", d: "Trả tiền mặt cho shipper", icon: Truck },
                  { v: "bank_transfer", l: "Chuyển khoản ngân hàng", d: "Quét QR hoặc chuyển khoản", icon: Landmark },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const selected = form.payment_method === opt.v;
                  return (
                    <label
                      key={opt.v}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        selected ? "border-green-500 bg-green-50" : "border-green-100 hover:border-green-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={opt.v}
                        checked={selected}
                        onChange={() => setForm({ ...form, payment_method: opt.v as any })}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-sm">
                          <Icon className="w-4 h-4 text-green-700" /> {opt.l}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{opt.d}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
          <div className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm h-fit">
            <img src={product.image_url || ""} className="w-full h-32 object-cover rounded-md" alt="" />
            <div className="mt-2 font-semibold">{product.name}</div>
            <div className="text-sm text-gray-500">Đơn giá: {formatVND(Number(product.price))}</div>
            <div className="text-sm">Số lượng: {form.quantity}</div>
            <div className="border-t mt-2 pt-2 text-green-700 font-bold">Tổng: {formatVND(total)}</div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
