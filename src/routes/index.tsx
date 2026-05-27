import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatVND } from "@/lib/format";
import { Leaf, Sprout, Droplets, Sun, ShoppingBag, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data || [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => (await supabase.from("products").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(8)).data || [],
  });

  return (
    <SiteLayout>
      <section className="relative bg-gradient-to-br from-green-100 via-green-50 to-white">
        <div className="container mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-green-200 text-green-800 text-xs font-medium">Đồ án tốt nghiệp</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-green-900 leading-tight">Mua sắm cây trồng & Chăm sóc dễ dàng</h1>
            <p className="mt-4 text-gray-700">Khám phá hàng trăm loại cây cảnh, cây ăn quả, phân bón, dụng cụ làm vườn cùng kho thông tin chăm sóc cây và tra cứu bệnh cây.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"><ShoppingBag className="w-4 h-4"/>Mua sắm ngay</Link>
              <Link to="/care" className="px-5 py-3 bg-white border border-green-200 text-green-700 rounded-lg font-medium hover:bg-green-50 flex items-center gap-2"><BookOpen className="w-4 h-4"/>Hướng dẫn chăm sóc</Link>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800" alt="Cây cảnh" className="rounded-2xl shadow-xl w-full h-80 object-cover"/>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-green-100">
              <Leaf className="w-8 h-8 text-green-600"/>
              <div><div className="font-semibold">100+ loại cây</div><div className="text-xs text-gray-500">Giao toàn quốc</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-green-900 mb-8">Danh mục sản phẩm</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c: any) => (
            <Link key={c.id} to="/products" search={{ category: c.id } as any} className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border border-green-100 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200">
                <Sprout className="w-6 h-6 text-green-700"/>
              </div>
              <div className="mt-3 font-medium text-sm text-gray-800">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-900">Sản phẩm nổi bật</h2>
          <Link to="/products" className="text-green-700 text-sm font-medium hover:underline">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-green-100">
              <img src={p.image_url || "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600"} alt={p.name} className="w-full h-44 object-cover"/>
              <div className="p-3">
                <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                <div className="mt-1 text-green-700 font-bold">{formatVND(Number(p.price))}</div>
                <div className="text-xs text-gray-500">Còn {p.stock_quantity}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-green-50 py-14">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[{icon:Droplets,t:"Tưới nước đúng cách",d:"Hướng dẫn lượng nước, tần suất cho từng loại cây."},{icon:Sun,t:"Ánh sáng phù hợp",d:"Mỗi cây cần cường độ ánh sáng riêng để phát triển tốt."},{icon:Leaf,t:"Phân bón hiệu quả",d:"Kết hợp phân hữu cơ và NPK giúp cây khỏe mạnh."}].map((it,i)=>(
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <it.icon className="w-10 h-10 text-green-600"/>
              <h3 className="mt-3 font-semibold text-lg">{it.t}</h3>
              <p className="mt-2 text-sm text-gray-600">{it.d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
