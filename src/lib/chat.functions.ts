import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `Bạn là "Trợ lý chăm sóc cây" của website Trade & Care Plants — chuyên về cây cảnh và cây ăn quả tại Việt Nam.
- Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dễ hiểu.
- Tập trung vào: tưới nước, ánh sáng, đất trồng, phân bón, sâu bệnh, cách trồng và chăm sóc cây.
- Khi phù hợp, gợi ý loại sản phẩm có thể giúp (phân bón, thuốc trị bệnh, dụng cụ làm vườn).
- Nếu câu hỏi không liên quan đến cây trồng, lịch sự hướng người dùng quay lại chủ đề.
- Định dạng câu trả lời rõ ràng, có thể dùng gạch đầu dòng khi liệt kê.`;

export const chatWithAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      throw new Error("Chưa cấu hình LOVABLE_API_KEY");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
