"use client";

import { Star, Trash2 } from "lucide-react";
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
  const setMain = useMutation(api.attachments.setMainAttachment);

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

      {attachment.isMain ? (
        <span className="absolute left-2 top-2 inline-flex h-7 items-center gap-1 rounded-full bg-pastel-yellow px-2 text-[11px] font-bold text-ink">
          <Star size={12} fill="currentColor" />
          Principal
        </span>
      ) : null}

      {(attachment.caption || attachment.price != null) ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-[11px] text-white">
          <div className="min-w-0">
            {attachment.caption ? (
              <p className="truncate font-semibold">{attachment.caption}</p>
            ) : null}
            {attachment.price != null ? (
              <p>{currencyFormatter.format(attachment.price)}</p>
            ) : null}
          </div>
        </figcaption>
      ) : null}

      {editable ? (
        <div className="absolute right-2 top-2 flex gap-1">
          {!attachment.isMain ? (
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-pastel-yellow"
              title="Definir como principal"
              onClick={() => void setMain({ id: attachment._id as Id<"attachments"> })}
            >
              <Star size={14} />
            </button>
          ) : null}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-pastel-pink"
            title="Apagar"
            onClick={() => void remove({ id: attachment._id as Id<"attachments"> })}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}
    </figure>
  );
}
