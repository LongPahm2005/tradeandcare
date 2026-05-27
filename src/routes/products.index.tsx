import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatVND } from "@/lib/format";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>) => ({ category: (s.category as string) || "", q: (s.q as string) || "" }),
  component: ProductList,
});

function ProductList() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q);
  const [cat, setCat] = useState(search.category);
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data || [],
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", q, cat, maxPrice],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)").eq("status", "active");
      if (q) query = query.ilike("name", `%${q}%`);
      if (cat) query = query.eq("category_id", cat);
      if (maxPrice) query = query.lte("price", maxPrice);
      const { data } = await query.order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-900 mb-6">Sản phẩm</h1>
        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-white p-4 rounded-xl shadow-sm border border-green-100 h-fit space-y-4">
            <div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-3 py-2 rounded-md border border-green-200 text-sm"/>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-sm">Danh mục</h3>
              <div className="space-y-1">
                <button onClick={()=>setCat("")} className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${!cat?"bg-green-100 text-green-800":"hover:bg-green-50"}`}>Tất cả</button>
                {categories.map((c:any)=>(
                  <button key={c.id} onClick={()=>setCat(c.id)} className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${cat===c.id?"bg-green-100 text-green-800":"hover:bg-green-50"}`}>{c.name}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-sm">Giá tối đa (VND)</h3>
              <input type="number" value={maxPrice} onChange={e=>setMaxPrice(e.target.value?Number(e.target.value):"")} placeholder="vd: 500000" className="w-full px-3 py-2 rounded-md border border-green-200 text-sm"/>
            </div>
          </aside>
          <div>
            {isLoading ? <div className="text-center py-10">Đang tải...</div> : products.length === 0 ? <div className="text-center py-10 text-gray-500">Không có sản phẩm</div> : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p:any)=>(
                  <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100">
                    <img src={p.image_url} alt={p.name} className="w-full h-44 object-cover"/>
                    <div className="p-3">
                      <div className="text-xs text-green-700">{p.categories?.name}</div>
                      <div className="font-semibold text-sm mt-1 line-clamp-1">{p.name}</div>
                      <div className="mt-1 text-green-700 font-bold">{formatVND(Number(p.price))}</div>
                      <div className="text-xs text-gray-500">{p.stock_quantity > 0 ? `Còn ${p.stock_quantity}` : "Hết hàng"}</div>
                      <Link to="/products/$id" params={{ id: p.id }} className="mt-2 block text-center bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 rounded-md">Xem chi tiết</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
