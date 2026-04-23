# Dashboard, Calendar & Image Attachments — Feature Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new capabilities to the renovation app:
1. **Image attachments** on tasks — upload from phone or web, optionally tag with a price and a note so shopping options (e.g. photos of flooring samples with prices), progress photos, and decoration inspiration all live next to the relevant task.
2. **Dashboard home page** — a summary that greets the user with tasks-by-status, financial KPIs, upcoming items, and a gallery strip of recent attachments.
3. **Calendar page** — a month/week view of tasks with start/due dates, with the ability to open a task modal inline and see attachments as thumbnails.

**Architecture:** Each milestone is independently shippable. Milestone 1 (Attachments) is the foundation that Milestones 2 and 3 reference. Storage uses Convex's built-in `_storage` (no S3 buckets, no extra services). Attachments are a new table; tasks stay unchanged. Dashboard and calendar are new routes that reuse existing queries.

**Tech Stack:** Next.js 16 App Router, Convex 1.36 (file storage + queries/mutations), Tailwind 4, Lucide icons. No new deps required.

---

## Domain Glossary (for this plan)

| Term | Meaning | DB field |
|---|---|---|
| Attachment | Any file (image) linked to a task | `attachments` table, row |
| Kind | What the attachment represents | `attachments.kind` — `option` \| `progress` \| `inspiration` |
| Option | A shopping candidate (e.g. flooring sample photo + price) | `kind: "option"`, `price` filled |
| Progress | Site photo during/after renovation work | `kind: "progress"` |
| Inspiration | Saved reference from a website or phone camera roll | `kind: "inspiration"`, often `sourceUrl` filled |
| Storage ID | Convex-issued opaque handle for the stored file blob | `attachments.storageId` (`v.id("_storage")`) |

---

## Milestone Breakdown

| Milestone | Ships | Depends on |
|---|---|---|
| M1 — Attachments backend + TaskModal UI | Upload, list, delete images on any task. Thumbnails on TaskCard. | — |
| M2 — Dashboard page at `/` | Greeting, KPI strip, upcoming tasks, recent attachments gallery. | M1 (gallery strip), otherwise independent |
| M3 — Calendar page at `/calendar` | Month + week toggle, tasks plotted on due/start dates, inline modal. | M1 for thumbnails, otherwise independent |

Each milestone ends on a green build + working page. Do not start M2 before M1 commits are merged, but M2 and M3 are independent after that.

---

## File Structure

**New files:**
- `convex/attachments.ts` — queries + mutations (generate upload URL, insert row, list by task, delete)
- `convex/dashboard.ts` — aggregated KPI query
- `components/AttachmentsSection.tsx` — grid + upload button inside TaskModal
- `components/AttachmentThumb.tsx` — single thumbnail tile
- `components/DashboardHero.tsx` — greeting + quick stats
- `components/StatusDonut.tsx` — simple SVG donut, no chart lib
- `components/UpcomingList.tsx` — next 5 tasks by due date
- `components/RecentAttachmentsStrip.tsx` — horizontal gallery on dashboard
- `components/Calendar.tsx` — month grid + week view toggle
- `app/dashboard/page.tsx` — or replace `app/page.tsx` redirect with the dashboard itself
- `app/calendar/page.tsx`
- `lib/calendar.ts` — pure date helpers (`startOfMonthGrid`, `groupTasksByDate`)
- `lib/dashboard.ts` — pure aggregation helpers (`countByStatus`, `nextUpcoming`)

**Modified:**
- `convex/schema.ts` — add `attachments` table
- `components/AppShell.tsx` — add `Dashboard` and `Calendar` nav items
- `components/TaskCard.tsx` — render up to 3 thumbnail squares if attachments exist
- `components/TaskModal.tsx` — mount `<AttachmentsSection />`
- `app/page.tsx` — point root to new dashboard (or redirect to `/dashboard`)
- `types/renovation.ts` — add `Attachment`, `AttachmentKind`

---

# Milestone 1 — Image Attachments

### Task 1.1: Schema + Convex file storage backend

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/attachments.ts`

- [ ] **Step 1: Add the `attachments` table to `convex/schema.ts`**

Insert above `activityLog`:

```ts
export const attachmentKindValidator = v.union(
  v.literal("option"),
  v.literal("progress"),
  v.literal("inspiration"),
);

// inside defineSchema({ ... })
  attachments: defineTable({
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    kind: attachmentKindValidator,
    caption: v.optional(v.string()),
    price: v.optional(v.union(v.number(), v.null())),
    sourceUrl: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),
```

- [ ] **Step 2: Create `convex/attachments.ts`**

```ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { attachmentKindValidator } from "./schema";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    storageId: v.id("_storage"),
    kind: attachmentKindValidator,
    caption: v.optional(v.string()),
    price: v.optional(v.union(v.number(), v.null())),
    sourceUrl: v.optional(v.string()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("attachments", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, { taskId }) => {
    const rows = await ctx.db
      .query("attachments")
      .withIndex("by_task", (q) => q.eq("taskId", taskId))
      .order("desc")
      .collect();
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: await ctx.storage.getUrl(row.storageId),
      })),
    );
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db.query("attachments").order("desc").take(limit ?? 12);
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        url: await ctx.storage.getUrl(row.storageId),
      })),
    );
  },
});

export const deleteAttachment = mutation({
  args: { id: v.id("attachments") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await ctx.storage.delete(row.storageId);
    await ctx.db.delete(id);
  },
});
```

- [ ] **Step 3: Push schema to Convex and verify**

Run: `npx convex dev` (leave it running in a second shell).
Expected: Convex prints `attachments` table creation; no validator errors.

- [ ] **Step 4: Commit**

```bash
git add convex/schema.ts convex/attachments.ts
git commit -m "feat(attachments): add convex storage-backed attachments table + CRUD"
```

---

### Task 1.2: Types + helper

**Files:**
- Modify: `types/renovation.ts`

- [ ] **Step 1: Append types**

```ts
export type AttachmentKind = "option" | "progress" | "inspiration";

export type Attachment = {
  _id: string;
  taskId: string;
  storageId: string;
  kind: AttachmentKind;
  caption?: string;
  price?: number | null;
  sourceUrl?: string;
  mimeType?: string;
  createdAt: number;
  url: string | null;
};
```

- [ ] **Step 2: Commit**

```bash
git add types/renovation.ts
git commit -m "feat(attachments): shared Attachment type"
```

---

### Task 1.3: `AttachmentThumb` component

**Files:**
- Create: `components/AttachmentThumb.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Attachment } from "@/types/renovation";
import { currencyFormatter } from "@/lib/constants";

const KIND_LABEL: Record<Attachment["kind"], string> = {
  option: "Opção",
  progress: "Obra",
  inspiration: "Ideia",
};

export function AttachmentThumb({
  attachment,
  editable = false,
}: {
  attachment: Attachment;
  editable?: boolean;
}) {
  const remove = useMutation(api.attachments.deleteAttachment);

  return (
    <figure className="group relative overflow-hidden rounded-2xl bg-surface shadow-soft">
      {attachment.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.caption ?? KIND_LABEL[attachment.kind]}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="aspect-square w-full bg-border" />
      )}

      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 text-[11px] text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold">{attachment.caption ?? KIND_LABEL[attachment.kind]}</p>
          {attachment.price != null ? (
            <p>{currencyFormatter.format(attachment.price)}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-white/90 px-2 py-0.5 text-ink">{KIND_LABEL[attachment.kind]}</span>
      </figcaption>

      {editable ? (
        <button
          type="button"
          className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink group-hover:flex"
          title="Apagar"
          onClick={() => void remove({ id: attachment._id as never })}
        >
          <Trash2 size={14} />
        </button>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AttachmentThumb.tsx
git commit -m "feat(attachments): thumbnail tile component"
```

---

### Task 1.4: `AttachmentsSection` component (upload + list)

**Files:**
- Create: `components/AttachmentsSection.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { AttachmentKind } from "@/types/renovation";
import { AttachmentThumb } from "./AttachmentThumb";

const KINDS: { value: AttachmentKind; label: string }[] = [
  { value: "option", label: "Opção" },
  { value: "progress", label: "Obra" },
  { value: "inspiration", label: "Ideia" },
];

export function AttachmentsSection({ taskId }: { taskId: Id<"tasks"> }) {
  const attachments = useQuery(api.attachments.listByTask, { taskId });
  const generateUrl = useMutation(api.attachments.generateUploadUrl);
  const createAttachment = useMutation(api.attachments.createAttachment);

  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<AttachmentKind>("option");
  const [caption, setCaption] = useState("");
  const [price, setPrice] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload falhou (${res.status})`);
        const { storageId } = (await res.json()) as { storageId: string };
        await createAttachment({
          taskId,
          storageId: storageId as Id<"_storage">,
          kind,
          caption: caption.trim() || undefined,
          price: price.trim() === "" ? null : Number(price),
          sourceUrl: sourceUrl.trim() || undefined,
          mimeType: file.type,
        });
      }
      setCaption("");
      setPrice("");
      setSourceUrl("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Fotos e inspirações</h3>
        <span className="text-xs text-ink-muted">{attachments?.length ?? 0}</span>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            onClick={() => setKind(k.value)}
            className={`h-8 rounded-full px-3 text-xs font-semibold ${
              kind === k.value ? "bg-ink text-white" : "bg-surface-raised text-ink-muted border border-border"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
          placeholder="Legenda (opcional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm"
          placeholder="Preço € (opcional)"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <LinkIcon size={14} className="text-ink-muted" />
          <input
            className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm"
            placeholder="Link (ideia)"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />
        </div>
      </div>

      <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        {uploading ? "A enviar..." : "Adicionar foto"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      {attachments && attachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {attachments.map((a) => (
            <AttachmentThumb key={a._id} attachment={a as never} editable />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Sem fotos ainda.</p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AttachmentsSection.tsx
git commit -m "feat(attachments): upload + list section for TaskModal"
```

---

### Task 1.5: Mount `AttachmentsSection` inside `TaskModal`

**Files:**
- Modify: `components/TaskModal.tsx`

- [ ] **Step 1: Import and render when editing an existing task**

Near the top, add: `import { AttachmentsSection } from "./AttachmentsSection";`

Inside the form, just above the final button row, insert:

```tsx
{task ? (
  <AttachmentsSection taskId={task._id} />
) : (
  <p className="rounded-xl bg-surface-raised p-3 text-xs text-ink-muted">
    Guarda a tarefa para poderes adicionar fotos.
  </p>
)}
```

- [ ] **Step 2: Verify flow**

Run: `npm run dev` (and keep `npx convex dev` running).
Expected: open an existing task → pick a file from phone camera roll or desktop → uploads → appears as a tile.

- [ ] **Step 3: Commit**

```bash
git add components/TaskModal.tsx
git commit -m "feat(attachments): mount uploads in TaskModal"
```

---

### Task 1.6: Thumbnails on `TaskCard`

**Files:**
- Modify: `components/TaskCard.tsx`

- [ ] **Step 1: Add a lightweight row of up to 3 thumbs**

At the top of `TaskCard`, after the existing `useMutation` hook:

```tsx
import { useQuery } from "convex/react";
// …
const attachments = useQuery(api.attachments.listByTask, { taskId: task._id });
```

Before the closing `</article>`, render:

```tsx
{attachments && attachments.length > 0 ? (
  <div className="mt-3 flex gap-1.5">
    {attachments.slice(0, 3).map((a) =>
      a.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={a._id}
          src={a.url}
          alt=""
          className="h-12 w-12 rounded-lg object-cover"
          loading="lazy"
        />
      ) : null,
    )}
    {attachments.length > 3 ? (
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/70 text-[11px] font-semibold text-ink">
        +{attachments.length - 3}
      </span>
    ) : null}
  </div>
) : null}
```

- [ ] **Step 2: Verify on `/kanban` — card shows thumbs after upload**

- [ ] **Step 3: Commit**

```bash
git add components/TaskCard.tsx
git commit -m "feat(attachments): thumbnail row on TaskCard"
```

---

# Milestone 2 — Dashboard at `/dashboard`

### Task 2.1: Aggregation helpers + Convex query

**Files:**
- Create: `lib/dashboard.ts`, `convex/dashboard.ts`

- [ ] **Step 1: `lib/dashboard.ts` — pure helpers**

```ts
import type { TaskStatus, TaskWithRelations } from "@/types/renovation";
import { STATUS_COLUMNS } from "./constants";

export function countByStatus(tasks: TaskWithRelations[]) {
  const out: Record<TaskStatus, number> = {
    backlog: 0, todo: 0, doing: 0, blocked: 0, waiting_material: 0, done: 0,
  };
  for (const t of tasks) out[t.status]++;
  return STATUS_COLUMNS.map((s) => ({ status: s.value, label: s.label, count: out[s.value] }));
}

export function nextUpcoming(tasks: TaskWithRelations[], limit = 5) {
  return [...tasks]
    .filter((t) => t.dueDate && t.status !== "done")
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, limit);
}

export function budgetTotals(tasks: TaskWithRelations[]) {
  let estimated = 0;
  let actual = 0;
  for (const t of tasks) {
    estimated += t.estimatedCost ?? 0;
    actual += t.actualCost ?? 0;
  }
  return { estimated, actual, diff: actual - estimated };
}
```

- [ ] **Step 2: `convex/dashboard.ts` — no-op wrapper (reuses listTasks on client)**

Skip this file if not needed. The dashboard reads via existing `api.tasks.listTasks` + `api.attachments.listRecent`, hydrating on the client the same way `app/costs/page.tsx` does.

- [ ] **Step 3: Commit**

```bash
git add lib/dashboard.ts
git commit -m "feat(dashboard): aggregation helpers"
```

---

### Task 2.2: `DashboardHero` + `StatusDonut` + `UpcomingList` + `RecentAttachmentsStrip`

**Files:**
- Create: `components/DashboardHero.tsx`, `components/StatusDonut.tsx`, `components/UpcomingList.tsx`, `components/RecentAttachmentsStrip.tsx`

- [ ] **Step 1: `components/DashboardHero.tsx`**

```tsx
export function DashboardHero({ name = "Maria" }: { name?: string }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 20 ? "Boa tarde" : "Boa noite";
  return (
    <header className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Resumo</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
        {greet}, {name}
      </h1>
      <p className="text-sm text-ink-muted">Aqui está o estado da renovação hoje.</p>
    </header>
  );
}
```

- [ ] **Step 2: `components/StatusDonut.tsx` — SVG donut, no lib**

```tsx
const COLORS: Record<string, string> = {
  backlog: "#e7e0d0",
  todo: "#c9dafb",
  doing: "#f7e26c",
  blocked: "#f9c6d1",
  waiting_material: "#d6c7f2",
  done: "#c8d89b",
};

export function StatusDonut({
  data,
}: {
  data: { status: string; label: string; count: number }[];
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let offset = 0;
  const radius = 60;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-5 rounded-3xl bg-surface p-5 shadow-soft">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f6f1e6" strokeWidth="22" />
        {data.map((d) => {
          const frac = d.count / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={d.status}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={COLORS[d.status] ?? "#141417"}
              strokeWidth="22"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 80 80)"
            />
          );
          offset += dash;
          return el;
        })}
        <text x="80" y="86" textAnchor="middle" className="fill-ink font-extrabold" fontSize="26">
          {total}
        </text>
      </svg>
      <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[d.status] }} />
            <span className="text-ink-muted">{d.label}</span>
            <span className="ml-auto font-semibold text-ink">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: `components/UpcomingList.tsx`**

```tsx
import { dateFormatter } from "@/lib/constants";
import type { TaskWithRelations } from "@/types/renovation";

export function UpcomingList({ tasks }: { tasks: TaskWithRelations[] }) {
  if (tasks.length === 0) {
    return <p className="rounded-2xl bg-surface p-4 text-sm text-ink-muted shadow-soft">Sem tarefas com data próxima.</p>;
  }
  return (
    <ol className="grid gap-2">
      {tasks.map((t) => (
        <li key={t._id} className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-soft">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{t.title}</p>
            <p className="text-xs text-ink-muted">{t.area?.name ?? "Sem área"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-pastel-yellow px-3 py-1 text-xs font-semibold text-ink">
            {t.dueDate ? dateFormatter.format(new Date(t.dueDate)) : "—"}
          </span>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: `components/RecentAttachmentsStrip.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AttachmentThumb } from "./AttachmentThumb";

export function RecentAttachmentsStrip() {
  const recent = useQuery(api.attachments.listRecent, { limit: 12 });
  if (!recent || recent.length === 0) {
    return <p className="rounded-2xl bg-surface p-4 text-sm text-ink-muted shadow-soft">Sem fotos recentes.</p>;
  }
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {recent.map((a) => (
        <div key={a._id} className="w-40 shrink-0">
          <AttachmentThumb attachment={a as never} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/DashboardHero.tsx components/StatusDonut.tsx components/UpcomingList.tsx components/RecentAttachmentsStrip.tsx
git commit -m "feat(dashboard): hero + donut + upcoming + gallery components"
```

---

### Task 2.3: Wire dashboard page

**Files:**
- Create: `app/dashboard/page.tsx`
- Modify: `app/page.tsx`, `components/AppShell.tsx`

- [ ] **Step 1: Create `app/dashboard/page.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { hydrateTasks } from "@/lib/taskLogic";
import { budgetTotals, countByStatus, nextUpcoming } from "@/lib/dashboard";
import { DashboardHero } from "@/components/DashboardHero";
import { StatusDonut } from "@/components/StatusDonut";
import { UpcomingList } from "@/components/UpcomingList";
import { RecentAttachmentsStrip } from "@/components/RecentAttachmentsStrip";
import { CostSummary } from "@/components/CostSummary";

export default function DashboardPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-2xl bg-surface p-6">A carregar dashboard...</div>;
  }

  const statuses = countByStatus(hydrated);
  const upcoming = nextUpcoming(hydrated, 5);
  const { estimated, actual, diff } = budgetTotals(hydrated);

  return (
    <div className="space-y-6">
      <DashboardHero />

      <div className="grid gap-4 md:grid-cols-3">
        <CostSummary label="Total estimado" value={estimated} />
        <CostSummary label="Total real" value={actual} />
        <CostSummary label="Diferença" value={diff} tone={diff <= 0 ? "good" : "bad"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Por estado</h2>
          <StatusDonut data={statuses} />
        </section>
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Próximas</h2>
          <UpcomingList tasks={upcoming} />
        </section>
      </div>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-muted">Fotos recentes</h2>
        <RecentAttachmentsStrip />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Redirect root to dashboard**

Replace `app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 3: Add the nav item**

In `components/AppShell.tsx`, prepend to `navItems` (keep on mobile — it's the home screen):

```tsx
{ href: "/dashboard", label: "Resumo", icon: Home },
```

Add `Home` to the lucide import line. Bottom tab bar already filters by `mobile !== false` (set in the restyle plan), so `Plano` and `Definições` stay desktop-only; the mobile bar holds exactly 5: Resumo, Checklist, Kanban, Custos, plus Calendário once M3 lands.

- [ ] **Step 4: Verify**

Run: `npm run dev` → open `http://localhost:3000/` → should redirect to `/dashboard` → see greeting, donut, upcoming list, attachments strip.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/page.tsx components/AppShell.tsx
git commit -m "feat(dashboard): summary page at /dashboard"
```

---

# Milestone 3 — Calendar at `/calendar`

### Task 3.1: Pure date helpers

**Files:**
- Create: `lib/calendar.ts`

- [ ] **Step 1: Write helpers**

```ts
import type { TaskWithRelations } from "@/types/renovation";

export function startOfMonthGrid(anchor: Date): Date {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const weekday = (first.getDay() + 6) % 7; // Monday = 0
  first.setDate(first.getDate() - weekday);
  return first;
}

export function monthGrid(anchor: Date): Date[] {
  const start = startOfMonthGrid(anchor);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function groupTasksByDate(tasks: TaskWithRelations[]): Map<string, TaskWithRelations[]> {
  const map = new Map<string, TaskWithRelations[]>();
  for (const t of tasks) {
    const key = t.dueDate ?? t.startDate;
    if (!key) continue;
    const iso = key.slice(0, 10);
    const arr = map.get(iso) ?? [];
    arr.push(t);
    map.set(iso, arr);
  }
  return map;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/calendar.ts
git commit -m "feat(calendar): date grid + grouping helpers"
```

---

### Task 3.2: `Calendar` component (month view)

**Files:**
- Create: `components/Calendar.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TaskWithRelations } from "@/types/renovation";
import { groupTasksByDate, isoDay, monthGrid } from "@/lib/calendar";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function Calendar({
  tasks,
  onOpenTask,
}: {
  tasks: TaskWithRelations[];
  onOpenTask: (task: TaskWithRelations) => void;
}) {
  const [anchor, setAnchor] = useState(() => new Date());
  const grid = useMemo(() => monthGrid(anchor), [anchor]);
  const grouped = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const todayIso = isoDay(new Date());
  const currentMonth = anchor.getMonth();

  return (
    <section className="rounded-3xl bg-surface p-4 shadow-soft">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink">
          {MONTHS[anchor.getMonth()]} {anchor.getFullYear()}
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink hover:bg-ink hover:text-white"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="h-9 rounded-full bg-surface-raised px-3 text-xs font-semibold text-ink"
            onClick={() => setAnchor(new Date())}
          >
            Hoje
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-ink hover:bg-ink hover:text-white"
            onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
            aria-label="Mês seguinte"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-2">
        {grid.map((d) => {
          const iso = isoDay(d);
          const items = grouped.get(iso) ?? [];
          const dim = d.getMonth() !== currentMonth;
          const today = iso === todayIso;
          return (
            <div
              key={iso}
              className={`min-h-24 rounded-2xl p-2 ${
                today ? "ring-2 ring-ink" : ""
              } ${dim ? "bg-surface-raised/40 text-ink-muted" : "bg-surface-raised text-ink"}`}
            >
              <div className="mb-1 text-xs font-semibold">{d.getDate()}</div>
              <ul className="grid gap-1">
                {items.slice(0, 3).map((t) => (
                  <li key={t._id}>
                    <button
                      type="button"
                      className="w-full truncate rounded-lg bg-pastel-yellow px-2 py-1 text-left text-[11px] font-medium text-ink hover:bg-pastel-pink"
                      onClick={() => onOpenTask(t)}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
                {items.length > 3 ? (
                  <li className="text-[10px] text-ink-muted">+{items.length - 3} mais</li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Calendar.tsx
git commit -m "feat(calendar): month grid component"
```

---

### Task 3.3: Calendar page + nav entry

**Files:**
- Create: `app/calendar/page.tsx`
- Modify: `components/AppShell.tsx`

- [ ] **Step 1: `app/calendar/page.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { CalendarDays } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Calendar } from "@/components/Calendar";
import { TaskModal } from "@/components/TaskModal";
import { hydrateTasks } from "@/lib/taskLogic";
import type { TaskWithRelations } from "@/types/renovation";

export default function CalendarPage() {
  const tasks = useQuery(api.tasks.listTasks);
  const people = useQuery(api.people.listPeople);
  const areas = useQuery(api.areas.listAreas);
  const [selected, setSelected] = useState<TaskWithRelations | null>(null);

  const hydrated = useMemo(() => {
    if (!tasks || !people || !areas) return [];
    return hydrateTasks(tasks, people, areas);
  }, [areas, people, tasks]);

  if (!tasks || !people || !areas) {
    return <div className="rounded-2xl bg-surface p-6">A carregar calendário...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Calendário</p>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          <CalendarDays size={26} />
          Datas da renovação
        </h1>
      </div>
      <Calendar tasks={hydrated} onOpenTask={setSelected} />
      {selected ? (
        <TaskModal
          key={selected._id}
          task={selected}
          tasks={hydrated}
          people={people}
          areas={areas}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Add the nav item**

In `components/AppShell.tsx` `navItems`, insert after `/kanban` (keep on mobile):

```tsx
{ href: "/calendar", label: "Calendário", icon: CalendarDays },
```

Add `CalendarDays` to the Lucide import. The mobile bar's `mobile !== false` filter produces exactly 5 entries once this lands: Resumo, Checklist, Kanban, Calendário, Custos.

- [ ] **Step 3: Verify**

Run: `npm run dev` → `/calendar`.
Expected: current month grid, today highlighted, tasks appearing on their due dates, clicking one opens the task modal (attachments visible if any).

- [ ] **Step 4: Commit**

```bash
git add app/calendar/page.tsx components/AppShell.tsx
git commit -m "feat(calendar): calendar page with month grid + modal open"
```

---

### Task 3.4: Build + typecheck green

**Files:** none

- [ ] **Step 1: Build**

Run: `npm run build`
Expected: build succeeds; no TS errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: lint passes or only pre-existing warnings.

- [ ] **Step 3: Commit if any fixes were needed**

```bash
git add -A
git commit -m "chore: fix lint/type issues from dashboard+calendar milestones"
```

---

## Self-Review Notes

- **Scope boundaries respected:** no edits to `tasks` schema, no changes to `people`/`areas`/`activityLog`.
- **Each milestone ships independently:** M1 works without M2 or M3; M2 and M3 only read from existing + attachments APIs.
- **No freelancing:** all work here is explicitly requested (dashboard, calendar, image uploads with prices + inspiration URLs).
- **Out of scope (confirm with user before extending):** drag-to-reschedule on calendar; OCR of price tags from photos; external site scraping for inspiration; sharing attachments with non-owner people; week/day view toggles; event types separate from tasks.
- **Nav cap resolved:** the restyle plan introduces a `mobile?: boolean` field on nav items; `Plano` and `Definições` are flagged `mobile: false` so the bottom bar stays at 5 items once Resumo and Calendário land. Nothing further to decide.
