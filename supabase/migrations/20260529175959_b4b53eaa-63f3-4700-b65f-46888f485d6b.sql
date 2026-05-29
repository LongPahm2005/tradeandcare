CREATE TABLE public.ai_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_prompt text NOT NULL DEFAULT '',
  rules text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  temperature numeric NOT NULL DEFAULT 0.7,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_settings TO anon, authenticated;
GRANT ALL ON public.ai_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ai settings" ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage ai settings" ON public.ai_settings FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.ai_settings (system_prompt, rules, model, temperature) VALUES (
  'Bạn là "Trợ lý chăm sóc cây" của website Trade & Care Plants — chuyên về cây cảnh và cây ăn quả tại Việt Nam.',
  '- Luôn trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dễ hiểu.
- Tập trung vào: tưới nước, ánh sáng, đất trồng, phân bón, sâu bệnh, cách trồng và chăm sóc cây.
- Khi phù hợp, gợi ý loại sản phẩm có thể giúp (phân bón, thuốc trị bệnh, dụng cụ làm vườn).
- Nếu câu hỏi không liên quan đến cây trồng, lịch sự hướng người dùng quay lại chủ đề.
- Định dạng câu trả lời rõ ràng, có thể dùng gạch đầu dòng khi liệt kê.',
  'google/gemini-2.5-flash',
  0.7
);