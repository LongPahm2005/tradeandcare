import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ChatbotFab } from "./ChatbotFab";

export function SiteLayout({ children, hideChatbot }: { children: ReactNode; hideChatbot?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-green-50/30">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {!hideChatbot && <ChatbotFab />}
    </div>
  );
}
