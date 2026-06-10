"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getEventByCode, importEvent } from "@/lib/api/events";
import { decodeInviteHash } from "@/lib/inviteShare";
import { EventView } from "@/components/event/EventView";
import { Button } from "@/components/ui/Button";

export function PublicInvite({ code }: { code: string }) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    async function load() {
      const local = await getEventByCode(code);
      if (local) {
        if (active) setEventId(local.id);
        return;
      }
      // Not on this device — try to rebuild it from the self-contained link.
      const shared = decodeInviteHash(window.location.hash);
      if (shared && shared.shortCode.toUpperCase() === code.toUpperCase()) {
        const imported = await importEvent(shared);
        if (active) setEventId(imported.id);
        return;
      }
      if (active) setEventId(null);
    }
    load();
    return () => {
      active = false;
    };
  }, [code]);

  if (eventId === undefined) {
    return (
      <div className="grid place-items-center py-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (eventId === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation not found</h1>
        <p className="mt-2 text-muted">
          That link may have expired, or the event was deleted.
        </p>
        <Button onClick={() => router.push("/")} className="mt-5">
          Back to home
        </Button>
      </div>
    );
  }

  return <EventView eventId={eventId} hideHostControls />;
}
