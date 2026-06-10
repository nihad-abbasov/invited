"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Star, Trash2 } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { getEvent, updateEvent, setCoHosts, deleteEvent, isOrganizer } from "@/lib/api/events";
import type {
  CreateEventInput,
  EventBackground,
  EventFontPreset,
  EventLocation,
  InvitedEvent,
} from "@/lib/types";
import { combineDateAndTime, splitIsoForInputs } from "@/lib/format";
import { Field, TextInput, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/session/Avatar";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { BackgroundPicker } from "@/components/create/BackgroundPicker";
import { FontPicker } from "@/components/create/FontPicker";
import { AccentPicker } from "@/components/create/AccentPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, ready } = useSession();
  const { toast } = useToast();

  const [evt, setEvt] = useState<InvitedEvent | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [background, setBackground] = useState<EventBackground | null>(null);
  const [font, setFont] = useState<EventFontPreset>("display");
  const [accent, setAccent] = useState("#0a84ff");
  const [coHostIds, setCoHostIds] = useState<string[]>([]);

  useEffect(() => {
    getEvent(id).then((e) => {
      setEvt(e);
      if (!e) return;
      const dt = splitIsoForInputs(e.startAt);
      setTitle(e.title);
      setDescription(e.description ?? "");
      setDate(dt.date);
      setTime(dt.time);
      setLocationName(e.location?.name ?? "");
      setLocationAddress(e.location?.address ?? "");
      setBackground(e.background);
      setFont(e.font);
      setAccent(e.accent);
      setCoHostIds((e.coHosts ?? []).map((c) => c.id));
    });
  }, [id]);

  const startIso = useMemo(() => combineDateAndTime(date, time), [date, time]);
  const isPrimaryHost = ready && !!evt && user?.id === evt.hostId;
  const canEdit = ready && !!evt && isOrganizer(evt, user?.id);

  // Guests (excluding the primary host) who can be promoted to co-host.
  const promotableGuests = useMemo(
    () => (evt ? evt.guests.filter((g) => g.user.id !== evt.hostId) : []),
    [evt],
  );

  async function handleSave() {
    if (!evt || !title.trim() || !background) return;
    setSaving(true);
    const location: EventLocation | undefined = locationName.trim()
      ? { name: locationName.trim(), address: locationAddress.trim() || undefined }
      : undefined;
    const patch: Partial<CreateEventInput> = {
      title: title.trim(),
      description: description.trim() || undefined,
      startAt: startIso,
      location,
      background,
      font,
      accent,
    };
    await updateEvent(evt.id, patch);
    if (isPrimaryHost) {
      const coHosts = promotableGuests
        .filter((g) => coHostIds.includes(g.user.id))
        .map((g) => ({ id: g.user.id, name: g.user.name }));
      await setCoHosts(evt.id, coHosts);
    }
    setSaving(false);
    toast({ title: "Changes saved", variant: "success" });
    router.push(`/events/${evt.id}`);
  }

  async function handleDelete() {
    if (!evt) return;
    await deleteEvent(evt.id);
    toast({ title: "Event deleted", variant: "default" });
    router.push("/events");
  }

  function toggleCoHost(userId: string) {
    setCoHostIds((prev) =>
      prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId],
    );
  }

  if (evt === undefined || !ready) {
    return (
      <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-10 space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!evt) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Event not found</h1>
        <Button onClick={() => router.push("/events")} className="mt-5">
          Back to events
        </Button>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">You can&apos;t edit this event</h1>
        <p className="mt-2 text-muted">Only the host and co-hosts can make changes.</p>
        <Button onClick={() => router.push(`/events/${evt.id}`)} className="mt-5">
          Back to event
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/events/${evt.id}`)} className="text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Edit event</h1>
        <div className="w-16" />
      </div>

      <div className="space-y-8">
        <section className="space-y-5">
          <Field label="Event name">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rooftop Birthday" />
          </Field>
          <Field label="Description" hint="Optional. Tell guests what to expect.">
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <DatePicker value={date} onChange={setDate} />
            </Field>
            <Field label="Time">
              <TimePicker value={time} onChange={setTime} />
            </Field>
          </div>
          <Field label="Location">
            <TextInput value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="The Skyline Loft" />
          </Field>
          <Field label="Address">
            <TextInput value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="212 Mercer St, New York" />
          </Field>
        </section>

        <section>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2">Background</div>
          {background && <BackgroundPicker value={background} onChange={setBackground} />}
        </section>

        <section className="space-y-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2">Font</div>
            <FontPicker value={font} onChange={setFont} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-3">Accent</div>
            <AccentPicker value={accent} onChange={setAccent} />
          </div>
        </section>

        {isPrimaryHost && (
          <section>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2">Co-hosts</div>
            <p className="text-sm text-muted mb-3">
              Co-hosts can edit the event and share the invitation. Promote anyone who&apos;s already a guest.
            </p>
            {promotableGuests.length === 0 ? (
              <Card className="p-4 text-sm text-muted shadow-none">
                No guests yet. Once people RSVP, you can promote them to co-host here.
              </Card>
            ) : (
              <div className="space-y-2">
                {promotableGuests.map((g) => {
                  const active = coHostIds.includes(g.user.id);
                  return (
                    <Card key={g.id} className="p-2.5 shadow-none flex items-center gap-3">
                      <Avatar user={g.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{g.user.name}</div>
                        <div className="text-xs text-muted capitalize">{g.status}</div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={active ? "primary" : "outline"}
                        onClick={() => toggleCoHost(g.user.id)}
                      >
                        {active ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                        {active ? "Co-host" : "Make co-host"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline">
          {isPrimaryHost ? (
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-(--red) hover:text-(--red)">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/events/${evt.id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()} style={{ background: accent }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              This permanently removes the invitation, RSVPs, messages, playlist and album. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Keep event
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
