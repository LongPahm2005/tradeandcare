import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { formatVND } from "@/lib/format";

export const Route = createFileRoute("/products/$id")({ component: ProductDetail });

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await supabase.from("products").select("*, categories(id,name)").eq("id", id).maybeSingle()).data,
  });
  const { data: related = [] } = useQuery({
    queryKey: ["related", product?.category_id],
    enabled: !!product?.category_id,
    queryFn: async () => (await supabase.from("products").select("*").eq("category_id", product!.category_id).neq("id", id).limit(4)).data || [],
  });

  if (!product) return <SiteLayout><div className="container mx-auto px-4 py-16 text-center">Đang tải...</div></SiteLayout>;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
          <img src={product.image_url} alt={product.name} className="w-full h-96 object-cover rounded-xl"/>
          <div>
            <div className="text-sm text-green-700">{product.categories?.name}</div>
            <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
            <div className="text-3xl text-green-700 font-bold mt-4">{formatVND(Number(product.price))}</div>
            <div className="mt-2 text-sm text-gray-600">{product.stock_quantity > 0 ? `Còn ${product.stock_quantity} sản phẩm` : "Hết hàng"}</div>
            <p className="mt-4 text-gray-700">{product.description}</p>
            <Link to="/order/$productId" params={{ productId: product.id }} className="mt-6 inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">Đặt hàng ngay</Link>
          </div>
        </div>
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-green-900">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p:any)=>(
                <Link key={p.id} to="/products/$id" params={{ id: p.id }} className="bg-white rounded-xl overflow-hidden shadow-sm border border-green-100">
                  <img src={p.image_url} alt={p.name} className="w-full h-36 object-cover"/>
                  <div className="p-3">
                    <div className="font-semibold text-sm line-clamp-1">{p.name}</div>
                    <div className="text-green-700 font-bold text-sm mt-1">{formatVND(Number(p.price))}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
