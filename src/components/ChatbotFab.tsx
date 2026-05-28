import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Bot, User as UserIcon, MessageCircle, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Msg = { role: "bot" | "user"; text: string };

export function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Xin chào! Tôi là trợ lý chăm sóc cây. Bạn có thể hỏi về tưới nước, bệnh cây, phân bón..." },
  ]);
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("chatbot_responses").select("*").then(({ data }) => setResponses(data || []));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = (question: string) => {
    const lower = question.toLowerCase();
    const match = responses.find((r) => lower.includes(r.keyword.toLowerCase()));
    setMessages((m) => [
      ...m,
      { role: "user", text: question },
      {
        role: "bot",
        text: match
          ? `${match.response}${match.suggested_product_type ? `\n\nGợi ý sản phẩm: ${match.suggested_product_type}` : ""}`
          : "Xin lỗi, tôi chưa có thông tin về câu hỏi này. Bạn có thể thử các câu hỏi nhanh phía trên hoặc xem trang Chăm sóc cây.",
      },
    ]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    ask(input);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Chatbot</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 border-green-100 rounded-2xl overflow-hidden [&>button]:hidden fixed bottom-4 right-4 sm:bottom-6 sm:right-6 translate-x-0 translate-y-0 left-auto top-auto">
          <DialogTitle className="sr-only">Chatbot tư vấn cây</DialogTitle>
          <div className="bg-white flex flex-col h-[520px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-900">Trợ lý chăm sóc cây</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-green-100 flex items-center justify-center text-green-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-green-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "user" ? "bg-green-600 text-white" : "bg-green-50 text-gray-800"
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-green-100 bg-white">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {responses.slice(0, 5).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => ask(r.question_sample || r.keyword)}
                    className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 rounded-full border border-green-200 text-green-800 cursor-pointer"
                  >
                    {r.question_sample || r.keyword}
                  </button>
                ))}
              </div>
              <form onSubmit={submit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 px-3 py-2 rounded-full border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
