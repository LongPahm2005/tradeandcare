import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { AlertTriangle, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/diseases")({ component: Diseases });

function Diseases() {
  const [symptom, setSymptom] = useState("");
  const symptoms = ["Lá vàng","Héo lá","Thối rễ","Đốm nâu","Rụng lá","Sâu ăn lá"];

  const { data: results = [] } = useQuery({
    queryKey: ["diseases", symptom],
    queryFn: async () => {
      let query = supabase.from("plant_diseases").select("*");
      if (symptom) query = query.ilike("symptom", `%${symptom}%`);
      return (await query).data || [];
    },
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Tra cứu bệnh cây</h1>
        <p className="text-gray-600 mb-6">Chọn triệu chứng để xem nguyên nhân và cách xử lý.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={()=>setSymptom("")} className={`px-3 py-1.5 rounded-full text-sm ${!symptom?"bg-green-600 text-white":"bg-white border border-green-200"}`}>Tất cả</button>
          {symptoms.map(s=>(
            <button key={s} onClick={()=>setSymptom(s)} className={`px-3 py-1.5 rounded-full text-sm ${symptom===s?"bg-green-600 text-white":"bg-white border border-green-200 hover:bg-green-50"}`}>{s}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((d:any)=>(
            <div key={d.id} className="bg-white rounded-xl p-5 border border-green-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-yellow-700"/></div>
                <div className="flex-1">
                  <div className="text-xs text-green-700">{d.symptom}</div>
                  <h3 className="font-bold text-lg">{d.disease_name}</h3>
                  <div className="mt-2 text-sm"><b>Nguyên nhân:</b> {d.cause}</div>
                  <div className="mt-1 text-sm"><b>Giải pháp:</b> {d.solution}</div>
                  {d.suggested_product_type && (
                    <div className="mt-2 text-sm flex items-center gap-1 text-green-700"><ShoppingBag className="w-4 h-4"/>Gợi ý mua: {d.suggested_product_type}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
