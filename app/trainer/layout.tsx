import type { ReactNode } from "react";
import Link from "next/link";

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6">
        <aside className="w-60 space-y-2 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Trainer
          </p>
          <nav className="space-y-1">
            <Link href="/trainer/dashboard" className="block rounded px-3 py-1 hover:bg-slate-900">
              Dashboard
            </Link>
            <Link href="/trainer/events" className="block rounded px-3 py-1 hover:bg-slate-900">
              Events
            </Link>
            <Link href="/trainer/clients" className="block rounded px-3 py-1 hover:bg-slate-900">
              Clients
            </Link>
            <Link href="/trainer/messages" className="block rounded px-3 py-1 hover:bg-slate-900">
              Messages
            </Link>
            <Link href="/trainer/earnings" className="block rounded px-3 py-1 hover:bg-slate-900">
              Earnings
            </Link>
          </nav>
        </aside>
        <section className="flex-1">{children}</section>
      </div>
    </main>
  );
}

