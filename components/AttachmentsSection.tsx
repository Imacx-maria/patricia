"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Attachment, AttachmentKind } from "@/types/renovation";
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
            <AttachmentThumb key={a._id} attachment={a as unknown as Attachment} editable />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Sem fotos ainda.</p>
      )}
    </section>
  );
}
