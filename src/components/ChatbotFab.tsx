import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send, Bot, User as UserIcon, MessageCircle, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatWithAI } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK_QUESTIONS = [
  "Cách tưới nước cho cây cảnh?",
  "Cây bị vàng lá phải làm sao?",
  "Phân bón nào tốt cho cây ăn quả?",
  "Cách phòng trừ sâu bệnh?",
];

export function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là trợ lý AI chăm sóc cây 🌱. Bạn có thể hỏi tôi về tưới nước, bệnh cây, phân bón, hoặc cách trồng cây...",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const callChat = useServerFn(chatWithAI);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await callChat({
        data: { messages: next.slice(-10).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply || "(không có phản hồi)" }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${e?.message || "Có lỗi xảy ra, vui lòng thử lại."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Mở chatbot"
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Chatbot AI</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Trợ lý chăm sóc cây"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-green-100 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-green-100 bg-green-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-green-900">Trợ lý AI chăm sóc cây</div>
                <div className="text-[10px] text-green-700">Được hỗ trợ bởi Lovable AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="w-8 h-8 rounded-full hover:bg-green-100 flex items-center justify-center text-green-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-green-700" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-green-600 text-white whitespace-pre-wrap"
                      : "bg-green-50 text-gray-800 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1"
                  }`}
                >
                  {m.role === "assistant" ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-green-700" />
                </div>
                <div className="bg-green-50 text-gray-600 text-sm px-3 py-2 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang suy nghĩ...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-green-100 bg-white">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className="text-xs px-2.5 py-1 bg-green-50 hover:bg-green-100 rounded-full border border-green-200 text-green-800 cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi về cây..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-full border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Gửi"
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
