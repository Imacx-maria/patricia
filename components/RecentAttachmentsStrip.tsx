"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Attachment } from "@/types/renovation";
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
          <AttachmentThumb attachment={a as unknown as Attachment} />
        </div>
      ))}
    </div>
  );
}
