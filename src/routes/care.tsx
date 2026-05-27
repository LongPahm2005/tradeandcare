import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { Search, Droplets, Sun, Sprout, Beaker, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/care")({ component: Care });

function Care() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const { data: guides = [] } = useQuery({
    queryKey: ["care", q],
    queryFn: async () => {
      let query = supabase.from("plant_care_guides").select("*").order("plant_name");
      if (q) query = query.ilike("plant_name", `%${q}%`);
      return (await query).data || [];
    },
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Hướng dẫn chăm sóc cây</h1>
        <p className="text-gray-600 mb-6">Tra cứu thông tin chăm sóc các loại cây cảnh và cây ăn quả.</p>
        <div className="relative max-w-md mb-6">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên cây..." className="w-full pl-9 pr-3 py-2 rounded-md border border-green-200"/>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {guides.map((g:any)=>(
            <button key={g.id} onClick={()=>setSelected(g)} className="text-left bg-white rounded-xl overflow-hidden border border-green-100 shadow-sm hover:shadow-md">
              <img src={g.image_url} alt={g.plant_name} className="w-full h-40 object-cover"/>
              <div className="p-3">
                <div className="text-xs text-green-700">{g.plant_type}</div>
                <div className="font-semibold">{g.plant_name}</div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
              <img src={selected.image_url} alt="" className="w-full h-56 object-cover rounded-t-2xl"/>
              <div className="p-6">
                <div className="text-xs text-green-700">{selected.plant_type}</div>
                <h2 className="text-2xl font-bold">{selected.plant_name}</h2>
                <div className="mt-4 space-y-3">
                  {[{i:Droplets,l:"Tưới nước",v:selected.watering},{i:Sun,l:"Ánh sáng",v:selected.sunlight},{i:Sprout,l:"Đất trồng",v:selected.soil},{i:Beaker,l:"Phân bón",v:selected.fertilizer},{i:AlertCircle,l:"Lưu ý",v:selected.note}].map(r=>(
                    <div key={r.l} className="flex gap-3">
                      <r.i className="w-5 h-5 text-green-600 shrink-0 mt-0.5"/>
                      <div><div className="font-medium text-sm">{r.l}</div><div className="text-sm text-gray-700">{r.v}</div></div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setSelected(null)} className="mt-6 w-full bg-green-600 text-white py-2 rounded-md">Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
