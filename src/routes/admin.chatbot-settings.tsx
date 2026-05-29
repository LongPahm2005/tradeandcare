import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-pro",
  "google/gemini-3-flash-preview",
  "openai/gpt-5",
  "openai/gpt-5-mini",
  "openai/gpt-5-nano",
];

function Page() {
  const [id, setId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [rules, setRules] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setId(data.id);
        setSystemPrompt(data.system_prompt || "");
        setRules(data.rules || "");
        setModel(data.model || MODELS[0]);
        setTemperature(Number(data.temperature) || 0.7);
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      system_prompt: systemPrompt,
      rules,
      model,
      temperature,
      updated_at: new Date().toISOString(),
    };
    const res = id
      ? await supabase.from("ai_settings").update(payload).eq("id", id)
      : await supabase.from("ai_settings").insert(payload);
    setSaving(false);
    if (res.error) toast.error(res.error.message);
    else toast.success("Đã lưu cấu hình AI");
  };

  if (loading) return <AdminLayout><div>Đang tải...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Cấu hình AI Chatbot</h1>
          <p className="text-sm text-gray-600">Chatbot sẽ tự đọc cấu hình mới nhất từ database mỗi lần trả lời.</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-green-100 space-y-4">
          <div>
            <Label>System Prompt (vai trò của trợ lý)</Label>
            <Textarea rows={5} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder='Bạn là trợ lý chăm sóc cây...' />
          </div>
          <div>
            <Label>Quy tắc trả lời</Label>
            <Textarea rows={8} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="- Trả lời bằng tiếng Việt&#10;- Ngắn gọn, dễ hiểu..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Model AI</Label>
              <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <Label>Temperature ({temperature.toFixed(2)})</Label>
              <Input type="number" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
              <p className="text-xs text-gray-500 mt-1">0 = chính xác, 1 = cân bằng, 2 = sáng tạo cao</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute("/admin/chatbot-settings")({
  component: Page,
});
