"use client";

import { useRef, useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { addPhoto, removePhoto } from "@/lib/api/events";
import { fileToDataUrl } from "@/lib/api/photos";
import type { SharedAlbumPhoto, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/Dialog";

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
        <div className="text-sm text-muted">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} from the crew
        </div>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={!user || busy}>
          <Plus className="h-3.5 w-3.5" /> Add a photo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => add(e.target.files?.[0] ?? undefined)}
        />
      </div>

      {photos.length === 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={!user || busy}
          className="w-full aspect-[5/3] h-auto flex-col gap-2"
        >
          <ImagePlus className="h-7 w-7" />
          <div className="text-center">
            <div className="font-medium text-foreground">Start the shared album</div>
            <div className="text-xs font-normal text-muted">
              Photos appear here for everyone in this event.
            </div>
          </div>
        </Button>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((p) => (
            <motion.button
              key={p.id}
              layout
              type="button"
              onClick={() => setPreview(p)}
              className="relative aspect-square rounded-sm overflow-hidden hairline tap-spring group"
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

      <p className="mt-2 text-[11px] text-subtle">
        Photos are stored locally for now. Cloud sync coming soon.
      </p>

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          {preview && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.src} alt="" className="max-h-[80vh] max-w-full rounded-2xl shadow-(--shadow-pop) mx-auto" />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => remove(preview.id)} className="bg-black/60 text-white border-0">
                  Delete
                </Button>
                <Button size="icon" variant="secondary" onClick={() => setPreview(null)} className="bg-black/60 text-white border-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
