import { ReactNode, lazy, Suspense } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const ChatbotFab = lazy(() =>
  import("./ChatbotFab").then((m) => ({ default: m.ChatbotFab })),
);

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-green-50/30">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <ChatbotFab />
      </Suspense>
    </div>
  );
}
