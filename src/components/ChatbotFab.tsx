import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function ChatbotFab() {
  return (
    <Link to="/chatbot" className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2">
      <MessageCircle className="w-6 h-6"/>
      <span className="hidden sm:inline font-medium">Chatbot</span>
    </Link>
  );
}
