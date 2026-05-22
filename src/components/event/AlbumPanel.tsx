"use client";

import { useRef, useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { addPhoto, removePhoto } from "@/lib/api/events";
import { fileToDataUrl } from "@/lib/api/photos";
import type { SharedAlbumPhoto, User } from "@/lib/types";

interface Props {
  eventId: string;
  photos: SharedAlbumPhoto[];
  user: User | null;
  onChange: () => void;
}

export function AlbumPanel({ eventId, photos, user, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<SharedAlbumPhoto | null>(null);

  async function add(file: File | undefined) {
    if (!file || !user) return;
    setBusy(true);
    const src = await fileToDataUrl(file);
    await addPhoto(eventId, { src, uploadedBy: user.name });
    setBusy(false);
    onChange();
  }

  async function remove(id: string) {
    await removePhoto(eventId, id);
    if (preview?.id === id) setPreview(null);
    onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-[var(--foreground-secondary)]">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} from the crew
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={!user || busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hairline tap-spring disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add a photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => add(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={!user || busy}
          className="w-full aspect-[5/3] rounded-[var(--radius-md)] hairline grid place-items-center text-[var(--foreground-secondary)] tap-spring hover:bg-[var(--surface)] disabled:opacity-50"
        >
          <div className="text-center">
            <ImagePlus className="h-7 w-7 mx-auto mb-2" />
            <div className="font-medium text-[var(--foreground)]">Start the shared album</div>
            <div className="text-xs">Photos appear here for everyone in this event.</div>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((p) => (
            <motion.button
              key={p.id}
              layout
              type="button"
              onClick={() => setPreview(p)}
              className="relative aspect-square rounded-[var(--radius-sm)] overflow-hidden hairline tap-spring group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] text-white bg-gradient-to-t from-black/60 to-transparent">
                {p.uploadedBy}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-[var(--foreground-tertiary)]">
        Photos are stored locally for now. Cloud sync coming soon.
      </p>

      {preview && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/70 backdrop-blur" onClick={() => setPreview(null)}>
          <div className="relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.src} alt="" className="max-h-[80vh] max-w-full rounded-2xl shadow-[var(--shadow-pop)]" />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => remove(preview.id)}
                className="h-9 px-3 rounded-full bg-black/60 text-white text-xs"
              >
                Delete
              </button>
              <button
                onClick={() => setPreview(null)}
                className="h-9 w-9 rounded-full bg-black/60 text-white grid place-items-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
