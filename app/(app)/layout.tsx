import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <h1 className="text-lg font-bold">💑 우리 캘린더</h1>
        <Link href="/settings" aria-label="설정" className="flex h-10 w-10 items-center justify-center rounded-xl text-xl hover:bg-muted">
          ⚙️
        </Link>
      </header>
      <main className="px-4 py-2">{children}</main>
      <BottomNav />
    </div>
  );
}
