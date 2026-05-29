import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const FALLBACK_PROMPT = `Bạn là "Trợ lý chăm sóc cây" của Trade & Care Plants. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.`;

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("Chưa cấu hình LOVABLE_API_KEY");
    }

    // Load latest AI settings from DB
    let systemPrompt = FALLBACK_PROMPT;
    let model = "google/gemini-2.5-flash";
    let temperature = 0.7;
    try {
      const sb = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
      );
      const { data: cfg } = await sb
        .from("ai_settings")
        .select("system_prompt, rules, model, temperature")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cfg) {
        systemPrompt = [cfg.system_prompt, cfg.rules].filter(Boolean).join("\n\n") || FALLBACK_PROMPT;
        if (cfg.model) model = cfg.model;
        if (typeof cfg.temperature === "number") temperature = cfg.temperature;
      }
    } catch (e) {
      console.error("Không tải được ai_settings:", e);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("Quá nhiều yêu cầu, vui lòng thử lại sau ít phút.");
    }
    if (response.status === 402) {
      throw new Error("Đã hết hạn mức AI, vui lòng nạp thêm credits.");
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Lỗi khi gọi AI, vui lòng thử lại.");
    }

    const json: any = await response.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "";
    return { reply };
  });
