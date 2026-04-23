"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import {
  BarChart3,
  ClipboardList,
  Columns3,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { api } from "@/convex/_generated/api";

const navItems = [
  { href: "/mobile", label: "Checklist", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/plan", label: "Plano", icon: Zap },
  { href: "/costs", label: "Custos", icon: BarChart3 },
  { href: "/settings", label: "Definições", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const people = useQuery(api.people.listPeople);

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-[#ded6c9] bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/mobile" className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              Patricia
            </p>
            <h1 className="truncate text-lg font-semibold">Renovação da casa</h1>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                    active
                      ? "bg-teal-700 text-white"
                      : "text-slate-700 hover:bg-[#eee8de]"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 rounded-md border border-[#ded6c9] bg-white px-3 py-2 text-sm md:flex">
            <Users size={16} className="text-teal-700" />
            {people ? `${people.filter((person) => person.active).length} pessoas` : "A carregar"}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-5 md:pb-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#ded6c9] bg-[#fffdf8] md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                active ? "text-teal-700" : "text-slate-600"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
