"use client";

import { Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
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
          onClick={() => void remove({ id: attachment._id as Id<"attachments"> })}
        >
          <Trash2 size={14} />
        </button>
      ) : null}
    </figure>
  );
}
