"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Attachment } from "@/types/renovation";
import { AttachmentThumb } from "./AttachmentThumb";

const MAX_ATTACHMENTS = 4;

export function AttachmentsSection({ taskId }: { taskId: Id<"tasks"> }) {
  const attachments = useQuery(api.attachments.listByTask, { taskId });
  const generateUrl = useMutation(api.attachments.generateUploadUrl);
  const createAttachment = useMutation(api.attachments.createAttachment);

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const count = attachments?.length ?? 0;
  const remaining = MAX_ATTACHMENTS - count;
  const full = remaining <= 0;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const slots = Math.max(0, MAX_ATTACHMENTS - count);
    const picked = Array.from(files).slice(0, slots);
    if (picked.length === 0) {
      setError(`Máximo de ${MAX_ATTACHMENTS} fotos por tarefa.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of picked) {
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
          kind: "progress",
          mimeType: file.type,
        });
      }
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-border bg-surface-raised p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Fotos</h3>
        <span className="text-xs font-semibold text-ink-muted">
          {count}/{MAX_ATTACHMENTS}
        </span>
      </header>

      {attachments && attachments.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {attachments.map((a) => (
            <AttachmentThumb
              key={a._id}
              attachment={a as unknown as Attachment}
              editable
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Sem fotos ainda.</p>
      )}

      {!full ? (
        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white ${
              uploading ? "opacity-60" : "hover:opacity-90"
            }`}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            Tirar foto
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
              disabled={uploading || full}
            />
          </label>
          <label
            className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-ink ${
              uploading ? "opacity-60" : "hover:bg-background"
            }`}
          >
            <ImageIcon size={16} />
            Galeria
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
              disabled={uploading || full}
            />
          </label>
        </div>
      ) : (
        <p className="text-xs font-medium text-ink-muted">
          Limite de {MAX_ATTACHMENTS} fotos atingido. Apaga uma para adicionar outra.
        </p>
      )}

      {error ? <p className="text-xs font-medium text-pastel-pink">{error}</p> : null}
    </section>
  );
}
