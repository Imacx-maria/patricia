# Visual Restyle — Pastel Dashboard Aesthetic

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current beige/teal theme with a playful pastel aesthetic inspired by the Intelly dashboard references (cream background, pink/yellow/lavender/soft-blue cards, near-black sidebar with a yellow accent, generous rounded corners, soft drop shadows, bold sans-serif display type).

**Architecture:** Keep existing component boundaries; change only Tailwind design tokens in `globals.css`, the `AppShell` chrome, and the visual surfaces of shared primitives (badges, cards, KPI tiles, modal, kanban columns). No schema, data-model, or state changes. One commit per component so regressions are easy to isolate.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS 4 (`@theme inline` in `globals.css`), Lucide icons, existing components under `components/`.

---

## Reference Aesthetic (from user attachments)

- **Background:** warm cream `#F6F1E6`
- **Sidebar:** near-black `#141417`, rounded card with yellow accent dot `#F5D547`
- **Card surfaces (pastel):** pink `#F9C6D1`, butter yellow `#F7E26C`, lavender `#D6C7F2`, soft blue `#C9DAFB`, sage `#C8D89B`
- **Ink:** slate/near-black `#141417` on pastels; muted `#5B5B63` for meta text
- **Accent / CTA:** black pill buttons, white text, 12–14px radius
- **Radii:** cards `rounded-3xl` (24px), tiles `rounded-2xl` (16px), pills `rounded-full`
- **Shadow:** soft long shadow, e.g. `0 20px 40px -24px rgba(20,20,23,0.18)`
- **Typography:** sans-serif, display headings in heavy weight (700–800), tight tracking
- **Decoration:** optional 3D-ish shape glyph per card (puzzle piece, heart, sparkle) — out of scope for this plan; leave hook points.

## Visual Scope Map (what gets restyled)

| File | Changes |
|---|---|
| `app/globals.css` | Replace color tokens, add pastel palette, update font stack, keep Geist |
| `components/AppShell.tsx` | Dark rail sidebar on desktop, rounded search-ish header, bottom tab bar on mobile kept but restyled |
| `components/Badges.tsx` | Pill shape, pastel bg per status/priority |
| `components/TaskCard.tsx` | Rounded-2xl, pastel surface by `costCategory` or `status`, soft shadow |
| `components/KanbanColumn.tsx` | Column header pill, lighter column background |
| `components/KanbanBoard.tsx` | Spacing + column gap |
| `components/CostSummary.tsx` | Pastel KPI tiles with arrow trend glyph |
| `components/FilterBar.tsx` | Pill buttons, dark active state |
| `components/QuickAddTask.tsx` | Pill input + black pill submit |
| `components/TaskModal.tsx` | Light card modal, rounded-2xl inputs, black pill primary button |
| `components/PersonBadge.tsx` | Circular avatar with pastel ring |
| `app/mobile/page.tsx`, `app/kanban/page.tsx`, `app/costs/page.tsx`, `app/plan/page.tsx` | Heading typography + section spacing |

No logic changes. Only JSX class names, `globals.css`, and a new `lib/theme.ts` helper for palette constants.

---

## File Structure

Create:
- `lib/theme.ts` — pastel palette constants + `surfaceForCategory()` helper.

Modify:
- `app/globals.css`
- `components/AppShell.tsx`
- `components/Badges.tsx`
- `components/TaskCard.tsx`
- `components/KanbanColumn.tsx`
- `components/KanbanBoard.tsx`
- `components/CostSummary.tsx`
- `components/FilterBar.tsx`
- `components/QuickAddTask.tsx`
- `components/TaskModal.tsx`
- `components/PersonBadge.tsx`
- `app/mobile/page.tsx`, `app/kanban/page.tsx`, `app/costs/page.tsx`, `app/plan/page.tsx`

No new routes, no schema, no Convex changes.

---

### Task 0: Align on palette via design-system-picker skill

**Files:** none (discovery step)

- [ ] **Step 1: Invoke design skill**

Open a fresh agent and run the `design-system-picker` skill with this prompt:

> Apply the attached pastel dashboard aesthetic to an existing Next.js + Tailwind 4 project. Produce design tokens (CSS variables) for: background, surface, sidebar, pink/yellow/lavender/soft-blue/sage pastels, ink, muted-ink, accent-cta, border, shadow. Also specify: heading font scale, radii scale (2xl/3xl/full), and a `surfaceForCategory` mapping for {materials, labor, tools, furniture, decoration, other} → pastel.

- [ ] **Step 2: Record the tokens**

Paste the chosen tokens into this plan under "Reference Aesthetic" above, replacing the provisional hexes if the skill suggests different ones.

- [ ] **Step 3: Commit the plan update**

```bash
git add docs/superpowers/plans/2026-04-24-visual-restyle.md
git commit -m "docs(plan): lock pastel palette tokens from design-system-picker"
```

---

### Task 1: Rewrite global design tokens

**Files:**
- Modify: `app/globals.css`
- Create: `lib/theme.ts`

- [ ] **Step 1: Replace `app/globals.css` with the pastel token set**

```css
@import "tailwindcss";

:root {
  --background: #f6f1e6;
  --surface: #ffffff;
  --surface-raised: #fffdf8;
  --sidebar: #141417;
  --sidebar-ink: #f4efe4;
  --ink: #141417;
  --ink-muted: #5b5b63;
  --border: #e7e0d0;
  --accent: #141417;
  --accent-contrast: #ffffff;
  --pastel-pink: #f9c6d1;
  --pastel-yellow: #f7e26c;
  --pastel-lavender: #d6c7f2;
  --pastel-blue: #c9dafb;
  --pastel-sage: #c8d89b;
  --dot-accent: #f5d547;
  --shadow-soft: 0 20px 40px -24px rgba(20, 20, 23, 0.18);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--ink);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-sidebar: var(--sidebar);
  --color-sidebar-ink: var(--sidebar-ink);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-contrast: var(--accent-contrast);
  --color-pastel-pink: var(--pastel-pink);
  --color-pastel-yellow: var(--pastel-yellow);
  --color-pastel-lavender: var(--pastel-lavender);
  --color-pastel-blue: var(--pastel-blue);
  --color-pastel-sage: var(--pastel-sage);
  --color-dot-accent: var(--dot-accent);
  --font-sans: "Geist", "Geist Fallback", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace;
}

body {
  background: var(--background);
  color: var(--ink);
  font-family: var(--font-sans);
}

button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: 0.55; }

.shadow-soft { box-shadow: var(--shadow-soft); }
```

- [ ] **Step 2: Create `lib/theme.ts`**

```ts
import type { CostCategory, TaskStatus } from "@/types/renovation";

export const PASTEL_BY_CATEGORY: Record<CostCategory, string> = {
  materials: "bg-pastel-blue",
  labor: "bg-pastel-sage",
  tools: "bg-pastel-lavender",
  furniture: "bg-pastel-yellow",
  decoration: "bg-pastel-pink",
  other: "bg-surface-raised",
};

export const PASTEL_BY_STATUS: Record<TaskStatus, string> = {
  backlog: "bg-surface-raised",
  todo: "bg-pastel-blue",
  doing: "bg-pastel-yellow",
  blocked: "bg-pastel-pink",
  waiting_material: "bg-pastel-lavender",
  done: "bg-pastel-sage",
};

export function surfaceForCategory(category: CostCategory) {
  return PASTEL_BY_CATEGORY[category] ?? "bg-surface-raised";
}
```

- [ ] **Step 3: Run dev server and verify background + body font**

Run: `npm run dev` then open `http://localhost:3000/mobile`.
Expected: cream background, dark text, layout unbroken (colors elsewhere will look wrong until later tasks — that's fine).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css lib/theme.ts
git commit -m "style(theme): pastel design tokens + per-category surface helper"
```

---

### Task 2: Restyle `AppShell` (desktop rail + mobile tabs)

**Files:**
- Modify: `components/AppShell.tsx`

Target look: dark rounded sidebar on desktop (`md:` and up) with a yellow accent dot next to the brand; cream content on the right. Mobile keeps the bottom tab bar but pill-shaped active state.

- [ ] **Step 1: Replace `AppShell.tsx` body with the two-column layout**

```tsx
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

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof ClipboardList;
  mobile?: boolean;
}> = [
  { href: "/mobile", label: "Checklist", icon: ClipboardList },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/plan", label: "Plano", icon: Zap, mobile: false },
  { href: "/costs", label: "Custos", icon: BarChart3 },
  { href: "/settings", label: "Definições", icon: Settings, mobile: false },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const people = useQuery(api.people.listPeople);

  return (
    <div className="min-h-screen bg-background text-ink md:grid md:grid-cols-[240px_1fr] md:gap-6 md:p-4">
      <aside className="hidden md:flex md:flex-col md:gap-6 md:rounded-3xl md:bg-sidebar md:p-5 md:text-sidebar-ink md:shadow-soft">
        <Link href="/mobile" className="flex items-center gap-2">
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
        <header className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/mobile" className="flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-sidebar text-sidebar-ink">
              <span className="text-base font-black">p</span>
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-dot-accent" />
            </span>
            <span className="text-base font-extrabold">patricia</span>
          </Link>
        </header>

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
```

- [ ] **Step 2: Verify in browser — desktop and mobile viewport**

Run: `npm run dev` — check `/mobile` and `/kanban` at 1440px width and 390px width.
Expected: dark rail visible on desktop with yellow dot; cream content; on mobile the rail disappears and bottom nav shows.

- [ ] **Step 3: Commit**

```bash
git add components/AppShell.tsx
git commit -m "style(shell): dark rounded rail + pastel shell"
```

---

### Task 3: Restyle `Badges.tsx`

**Files:**
- Modify: `components/Badges.tsx`

- [ ] **Step 1: Read current file**

Run: `cat components/Badges.tsx` to confirm the exported names (`StatusBadge`, `PriorityBadge`).

- [ ] **Step 2: Rewrite as pill badges with pastel bg**

Replace the file with:

```tsx
import type { TaskPriority, TaskStatus } from "@/types/renovation";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";

const statusClass: Record<TaskStatus, string> = {
  backlog: "bg-surface-raised text-ink-muted",
  todo: "bg-pastel-blue text-ink",
  doing: "bg-pastel-yellow text-ink",
  blocked: "bg-pastel-pink text-ink",
  waiting_material: "bg-pastel-lavender text-ink",
  done: "bg-pastel-sage text-ink",
};

const priorityClass: Record<TaskPriority, string> = {
  low: "bg-surface-raised text-ink-muted",
  medium: "bg-pastel-blue text-ink",
  high: "bg-pastel-yellow text-ink",
  critical: "bg-pastel-pink text-ink",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${statusClass[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${priorityClass[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
```

- [ ] **Step 3: Verify badges render on `/kanban`**

Expected: pill-shaped, pastel backgrounds, no clipped text.

- [ ] **Step 4: Commit**

```bash
git add components/Badges.tsx
git commit -m "style(badges): pastel pills"
```

---

### Task 4: Restyle `TaskCard`

**Files:**
- Modify: `components/TaskCard.tsx`

- [ ] **Step 1: Update classNames only (no logic changes)**

Swap the `<article>` and inline badges to use the new surface helper. Keep all props and handlers identical.

```tsx
import { surfaceForCategory } from "@/lib/theme";
// …existing imports

return (
  <article
    className={`rounded-2xl ${surfaceForCategory(task.costCategory)} p-4 shadow-soft transition hover:-translate-y-0.5`}
    onClick={() => onOpen(task)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-bold leading-5 text-ink">{task.title}</h3>
        <p className="mt-1 text-xs text-ink-muted">{task.area?.name ?? "Sem área"}</p>
      </div>
      <button
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink hover:bg-ink hover:text-white"
        title={task.status === "done" ? "Reabrir" : "Marcar como feito"}
        onClick={(event) => {
          event.stopPropagation();
          void toggleDone({ id: task._id, done: task.status !== "done" });
        }}
      >
        {task.status === "done" ? <RotateCcw size={16} /> : <Check size={17} />}
      </button>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
      {derived.isBlocked ? (
        <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">Bloqueada</span>
      ) : null}
      {task.materialNeeded ? (
        <span className="inline-flex h-6 items-center rounded-full bg-white/70 px-2.5 text-[11px] font-semibold text-ink">Material</span>
      ) : null}
    </div>

    {!compact ? (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <PersonBadge person={task.owner} />
        {task.dueDate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
            <CalendarDays size={12} />
            {dateFormatter.format(new Date(task.dueDate))}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-ink">
          <Euro size={12} />
          {currencyFormatter.format(task.estimatedCost ?? 0)} / {currencyFormatter.format(task.actualCost ?? 0)}
        </span>
      </div>
    ) : null}

    {!compact && derived.isBlocked ? <BlockedReasons reasons={derived.reasons} /> : null}
  </article>
);
```

- [ ] **Step 2: Verify card on `/kanban` and `/mobile`**

Expected: pastel surface by category; soft shadow; pill check button on the right.

- [ ] **Step 3: Commit**

```bash
git add components/TaskCard.tsx
git commit -m "style(task-card): pastel rounded surfaces with soft shadow"
```

---

### Task 5: Restyle Kanban column + board

**Files:**
- Modify: `components/KanbanColumn.tsx`, `components/KanbanBoard.tsx`

- [ ] **Step 1: Column header pill + column bg**

In `KanbanColumn.tsx`, wrap each column in `rounded-3xl bg-surface p-4 shadow-soft` and put the title in a pill:

```tsx
<section className="flex w-72 shrink-0 flex-col gap-3 rounded-3xl bg-surface p-4 shadow-soft">
  <header className="flex items-center justify-between">
    <span className="inline-flex h-7 items-center rounded-full bg-ink px-3 text-xs font-semibold text-white">
      {label}
    </span>
    <span className="text-xs text-ink-muted">{tasks.length}</span>
  </header>
  <div className="flex flex-col gap-3">{/* cards */}</div>
</section>
```

- [ ] **Step 2: Board gap + horizontal scroll**

In `KanbanBoard.tsx`, change the columns wrapper to `flex gap-4 overflow-x-auto pb-4`.

- [ ] **Step 3: Verify `/kanban` in browser**

Expected: light columns on cream bg, dark header pill per column, cards breathe with gaps.

- [ ] **Step 4: Commit**

```bash
git add components/KanbanColumn.tsx components/KanbanBoard.tsx
git commit -m "style(kanban): rounded columns with dark header pills"
```

---

### Task 6: Restyle `CostSummary` KPI tiles

**Files:**
- Modify: `components/CostSummary.tsx`

- [ ] **Step 1: Rewrite tile markup**

```tsx
import { currencyFormatter } from "@/lib/constants";

export function CostSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const accent =
    tone === "good" ? "bg-pastel-sage" : tone === "bad" ? "bg-pastel-pink" : "bg-pastel-yellow";
  return (
    <div className={`flex flex-col gap-2 rounded-3xl ${accent} p-5 shadow-soft`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-3xl font-extrabold text-ink">{currencyFormatter.format(value)}</p>
    </div>
  );
}
```

- [ ] **Step 2: Verify `/costs`**

Expected: three fat pastel tiles stacked on mobile, three columns on md+.

- [ ] **Step 3: Commit**

```bash
git add components/CostSummary.tsx
git commit -m "style(costs): pastel KPI tiles"
```

---

### Task 7: Restyle `TaskModal` (inputs + buttons)

**Files:**
- Modify: `components/TaskModal.tsx`

- [ ] **Step 1: Global class swaps inside the modal**

Do a careful find/replace inside `TaskModal.tsx`:

| Find (className fragment) | Replace with |
|---|---|
| `border border-[#ded6c9] bg-white` | `border border-border bg-surface` |
| `rounded-md` (inputs & labels) | `rounded-xl` |
| `bg-teal-700 px-4 font-semibold text-white hover:bg-teal-800` | `bg-ink px-5 font-semibold text-white rounded-full hover:opacity-90` |
| `border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50` | `border border-pastel-pink px-4 text-sm font-semibold text-ink rounded-full hover:bg-pastel-pink/40` |
| Modal container class `rounded-md bg-white` | `rounded-3xl bg-surface shadow-soft` |

- [ ] **Step 2: Verify open/save/delete still work on `/kanban`**

Expected: form submits, delete confirms, no console errors.

- [ ] **Step 3: Commit**

```bash
git add components/TaskModal.tsx
git commit -m "style(task-modal): pastel card + black pill CTAs"
```

---

### Task 8: Restyle `FilterBar`, `QuickAddTask`, `PersonBadge`

**Files:**
- Modify: `components/FilterBar.tsx`, `components/QuickAddTask.tsx`, `components/PersonBadge.tsx`

- [ ] **Step 1: `FilterBar` — pill toggles**

Every toggle button becomes: `h-9 rounded-full px-3 text-xs font-semibold` with `bg-ink text-white` when active and `bg-surface text-ink border border-border` when inactive.

- [ ] **Step 2: `QuickAddTask` — pill input + pill submit**

Input: `h-11 rounded-full border border-border bg-surface px-4`.
Button: `h-11 rounded-full bg-ink px-5 font-semibold text-white`.

- [ ] **Step 3: `PersonBadge` — circular avatar**

```tsx
<span
  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-ink ring-2 ring-white"
  style={{ backgroundColor: person.color }}
>
  {person.initials}
</span>
```

- [ ] **Step 4: Verify filters and quick add on `/mobile`**

Expected: all interactive, active pill state is near-black.

- [ ] **Step 5: Commit**

```bash
git add components/FilterBar.tsx components/QuickAddTask.tsx components/PersonBadge.tsx
git commit -m "style(controls): pill filters, inputs, and person avatars"
```

---

### Task 9: Restyle page headings + section spacing

**Files:**
- Modify: `app/mobile/page.tsx`, `app/kanban/page.tsx`, `app/costs/page.tsx`, `app/plan/page.tsx`

- [ ] **Step 1: Replace the header pattern on each page**

Old:
```tsx
<p className="text-sm font-semibold uppercase tracking-[0.12em] text-teal-700">…</p>
<h1 className="text-2xl font-semibold text-slate-950">…</h1>
```

New:
```tsx
<div className="flex flex-col gap-1">
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">…</p>
  <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">…</h1>
</div>
```

- [ ] **Step 2: Verify all four pages**

Run: `npm run dev` — open `/mobile`, `/kanban`, `/costs`, `/plan`.
Expected: bold display heading, consistent vertical rhythm.

- [ ] **Step 3: Commit**

```bash
git add app/mobile/page.tsx app/kanban/page.tsx app/costs/page.tsx app/plan/page.tsx
git commit -m "style(pages): bold display headings"
```

---

### Task 10: Visual QA against references

**Files:** none (verification only)

- [ ] **Step 1: Capture screenshots**

Open `/mobile`, `/kanban`, `/costs` at 1440×900 and 390×844. Save to `docs/superpowers/plans/screenshots/2026-04-24-after/`.

- [ ] **Step 2: Side-by-side with reference images**

Compare to the user's Intelly references. Note any gap in: card radius, shadow softness, heading weight, pastel saturation.

- [ ] **Step 3: Build + typecheck**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit screenshots + final report**

```bash
git add docs/superpowers/plans/screenshots
git commit -m "docs(plan): after-screenshots for visual restyle"
```

---

## Self-Review Notes

- Palette tokens scoped only to `globals.css` + `lib/theme.ts` — swap later if the design skill produces different hexes.
- No schema, no Convex changes, no new routes: safe to ship independently of the feature plan.
- If the design skill in Task 0 disagrees with the provisional palette here, update the tokens in `globals.css` and re-run the remaining tasks — no other files depend on the literal hexes.
