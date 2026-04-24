"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Columns3,
  Home,
  Menu,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { api } from "@/convex/_generated/api";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof ClipboardList;
  mobile?: boolean;
}> = [
  { href: "/dashboard", label: "Resumo", icon: Home },
  { href: "/mobile", label: "Checklist", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/plan", label: "Plano", icon: Zap, mobile: false },
  { href: "/costs", label: "Custos", icon: BarChart3 },
  { href: "/settings", label: "Definições", icon: Settings, mobile: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const people = useQuery(api.people.listPeople);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-ink md:grid md:grid-cols-[240px_1fr] md:gap-6 md:p-4">
      <aside className="hidden md:flex md:flex-col md:gap-6 md:rounded-3xl md:bg-sidebar md:p-5 md:text-sidebar-ink md:shadow-soft">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
            <span className="text-lg font-black">p</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-dot-accent" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">patricia</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-ink"
                    : "text-sidebar-ink/80 hover:bg-white/10"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
          <Users size={14} />
          {people ? `${people.filter((p) => p.active).length} pessoas` : "…"}
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-sidebar text-sidebar-ink">
              <span className="text-base font-black">p</span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-dot-accent" />
            </span>
            <span className="text-base font-extrabold">patricia</span>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm md:hidden">
            <div className="ml-auto flex h-full w-72 max-w-[86vw] flex-col gap-5 bg-sidebar p-5 text-sidebar-ink shadow-soft">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink">
                    <span className="text-lg font-black">p</span>
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-dot-accent" />
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">patricia</span>
                </Link>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"
                  aria-label="Fechar menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                        active ? "bg-white text-ink" : "text-sidebar-ink/80 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
                <Users size={14} />
                {people ? `${people.filter((p) => p.active).length} pessoas` : "…"}
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-h-[calc(100vh-4rem)] px-4 pb-24 pt-4 md:px-0 md:pb-4 md:pt-0">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface md:hidden">
          {navItems.filter((item) => item.mobile !== false).map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  active ? "text-ink" : "text-ink-muted"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
