import { Navbar } from "@/components/layout/navbar";
import { TickerBar } from "@/components/layout/ticker-bar";
import { Footer } from "@/components/layout/footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <TickerBar />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
