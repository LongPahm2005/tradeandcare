import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useMemo, useState } from "react";
import { AlertTriangle, ShoppingBag, Search, X, Leaf, Loader2 } from "lucide-react";

export const Route = createFileRoute("/diseases")({ component: Diseases });

function Diseases() {
  const [symptom, setSymptom] = useState("");
  const [keyword, setKeyword] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const symptoms = ["Lá vàng", "Héo lá", "Thối rễ", "Đốm nâu", "Rụng lá", "Sâu ăn lá"];

  const { data: allDiseases = [], isLoading } = useQuery({
    queryKey: ["diseases-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plant_diseases")
        .select("*")
        .order("disease_name", { ascending: true });
      return data || [];
    },
  });

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allDiseases.filter((d: any) => {
      if (symptom && !(d.symptom || "").toLowerCase().includes(symptom.toLowerCase())) return false;
      if (!kw) return true;
      return (
        (d.disease_name || "").toLowerCase().includes(kw) ||
        (d.symptom || "").toLowerCase().includes(kw) ||
        (d.cause || "").toLowerCase().includes(kw) ||
        (d.solution || "").toLowerCase().includes(kw) ||
        (d.suggested_product_type || "").toLowerCase().includes(kw)
      );
    });
  }, [allDiseases, symptom, keyword]);

  const clearAll = () => {
    setSymptom("");
    setKeyword("");
  };
  const hasFilter = !!symptom || !!keyword;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Tra cứu bệnh cây</h1>
        <p className="text-gray-600 mb-6">
          Nhập triệu chứng hoặc tên bệnh để xem nguyên nhân và cách xử lý.
        </p>

        {/* Search box */}
        <div className="relative mb-4 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên bệnh, triệu chứng, nguyên nhân..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-green-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              aria-label="Xóa từ khóa"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick symptom chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSymptom("")}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              !symptom ? "bg-green-600 text-white" : "bg-white border border-green-200 hover:bg-green-50"
            }`}
          >
            Tất cả triệu chứng
          </button>
          {symptoms.map((s) => (
            <button
              key={s}
              onClick={() => setSymptom(symptom === s ? "" : s)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                symptom === s
                  ? "bg-green-600 text-white"
                  : "bg-white border border-green-200 hover:bg-green-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
              </span>
            ) : (
              <>
                Tìm thấy <b className="text-green-800">{results.length}</b> kết quả
                {hasFilter && (
                  <span>
                    {" "}
                    cho{" "}
                    {keyword && <span className="text-green-700">"{keyword}"</span>}
                    {keyword && symptom && " · "}
                    {symptom && <span className="text-green-700">{symptom}</span>}
                  </span>
                )}
              </>
            )}
          </div>
          {hasFilter && (
            <button onClick={clearAll} className="text-green-700 hover:underline">
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Results */}
        {!isLoading && results.length === 0 ? (
          <div className="bg-white border border-dashed border-green-200 rounded-xl p-10 text-center">
            <Leaf className="w-10 h-10 text-green-300 mx-auto mb-3" />
            <p className="text-gray-600">
              Không tìm thấy bệnh nào phù hợp. Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {results.map((d: any) => {
              const isOpen = expanded === d.id;
              return (
                <div
                  key={d.id}
                  className="bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {d.image_url && (
                    <img
                      src={d.image_url}
                      alt={d.disease_name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-yellow-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-green-700 mb-1">{d.symptom}</div>
                        <h3 className="font-bold text-lg text-green-900">{d.disease_name}</h3>
                        <div className={`mt-2 text-sm text-gray-700 ${isOpen ? "" : "line-clamp-2"}`}>
                          <b>Nguyên nhân:</b> {d.cause}
                        </div>
                        <div className={`mt-1 text-sm text-gray-700 ${isOpen ? "" : "line-clamp-2"}`}>
                          <b>Giải pháp:</b> {d.solution}
                        </div>
                        <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                          {d.suggested_product_type ? (
                            <Link
                              to="/products"
                              search={{ search: d.suggested_product_type } as any}
                              className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Mua: {d.suggested_product_type}
                            </Link>
                          ) : (
                            <span />
                          )}
                          <button
                            onClick={() => setExpanded(isOpen ? null : d.id)}
                            className="text-xs text-green-700 hover:underline"
                          >
                            {isOpen ? "Thu gọn" : "Xem thêm"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
