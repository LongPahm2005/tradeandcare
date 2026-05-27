import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";
import { Send, Bot, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/chatbot")({ component: Chatbot });

type Msg = { role: "bot" | "user"; text: string };

function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Xin chào! Tôi là trợ lý chăm sóc cây. Bạn có thể hỏi về tưới nước, bệnh cây, phân bón..." },
  ]);
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("chatbot_responses").select("*").then(({ data }) => setResponses(data || []));
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const ask = (question: string) => {
    const lower = question.toLowerCase();
    const match = responses.find(r => lower.includes(r.keyword.toLowerCase()));
    setMessages(m => [...m, { role: "user", text: question }, {
      role: "bot",
      text: match ? `${match.response}${match.suggested_product_type ? `\n\nGợi ý sản phẩm: ${match.suggested_product_type}` : ""}` : "Xin lỗi, tôi chưa có thông tin về câu hỏi này. Bạn có thể thử các câu hỏi nhanh phía trên hoặc xem trang Chăm sóc cây.",
    }]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    ask(input);
    setInput("");
  };

  return (
    <SiteLayout hideChatbot>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-green-900 mb-2">Chatbot tư vấn cây</h1>
        <p className="text-gray-600 mb-4">Trợ lý ảo trả lời câu hỏi chăm sóc cây cơ bản.</p>

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm flex flex-col h-[60vh]">
          <div className="p-3 border-b text-sm font-medium text-green-800">Trợ lý chăm sóc cây</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m,i)=>(
              <div key={i} className={`flex gap-2 ${m.role==="user"?"justify-end":""}`}>
                {m.role==="bot" && <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-green-700"/></div>}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${m.role==="user"?"bg-green-600 text-white":"bg-green-50 text-gray-800"}`}>{m.text}</div>
                {m.role==="user" && <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0"><UserIcon className="w-4 h-4 text-white"/></div>}
              </div>
            ))}
            <div ref={endRef}/>
          </div>
          <div className="p-3 border-t">
            <div className="flex flex-wrap gap-1 mb-2">
              {responses.slice(0,5).map(r=>(
                <button key={r.id} onClick={()=>ask(r.question_sample || r.keyword)} className="text-xs px-2 py-1 bg-green-50 hover:bg-green-100 rounded-full border border-green-200">{r.question_sample || r.keyword}</button>
              ))}
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Nhập câu hỏi..." className="flex-1 px-3 py-2 rounded-md border border-green-200"/>
              <button className="bg-green-600 text-white px-4 rounded-md"><Send className="w-4 h-4"/></button>
            </form>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
