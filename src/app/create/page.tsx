"use client";

import type {
  CreateEventInput,
  EventBackground,
  EventFontPreset,
  EventLocation,
} from "@/lib/types";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import { BackgroundPicker } from "@/components/create/BackgroundPicker";
import { combineDateAndTime, splitIsoForInputs } from "@/lib/format";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Field, Textarea, TextInput } from "@/components/ui/Field";
import { useSession } from "@/components/session/SessionProvider";
import { SignInDialog } from "@/components/session/SignInDialog";
import { AccentPicker } from "@/components/create/AccentPicker";
import { FontPicker } from "@/components/create/FontPicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useMemo, useState } from "react";
import { createEvent } from "@/lib/api/events";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useHydrated } from "@/lib/useHydrated";

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { id: 0, label: "Vibe" },
  { id: 1, label: "Details" },
  { id: 2, label: "Style" },
  { id: 3, label: "Review" },
];

const DEFAULT_BG: EventBackground = {
  kind: "emoji",
  emoji: "🎉",
  gradient: ["#ff7ab8", "#7a5cff"],
};

/** A sensible default: one week out at 7:00 PM, split into input strings. */
function defaultDateTime() {
  const d = new Date(Date.now() + 7 * 86_400_000);
  d.setHours(19, 0, 0, 0);
  return splitIsoForInputs(d.toISOString());
}

export default function CreatePage() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Empty on first render to avoid SSR/client date drift; seeded once after
  // hydration via "adjust state during render" (no setState-in-effect).
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const hydrated = useHydrated();
  const [dateSeeded, setDateSeeded] = useState(false);
  if (hydrated && !dateSeeded) {
    setDateSeeded(true);
    if (!date) {
      const dt = defaultDateTime();
      setDate(dt.date);
      setTime(dt.time);
    }
  }
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [background, setBackground] = useState<EventBackground>(DEFAULT_BG);
  const [font, setFont] = useState<EventFontPreset>("display");
  const [accent, setAccent] = useState<string>("#0a84ff");
  const [submitting, setSubmitting] = useState(false);

  // Prompt anonymous visitors to pick a name, once the session is known.
  const [autoPrompted, setAutoPrompted] = useState(false);
  if (ready && !user && !autoPrompted) {
    setAutoPrompted(true);
    setSignInOpen(true);
  }

  const startIso = useMemo(() => combineDateAndTime(date, time), [date, time]);

  function canAdvance(from: Step): boolean {
    if (from === 1) return title.trim().length > 0 && Boolean(date);
    return true;
  }

  async function handleSubmit() {
    if (!user || !title.trim()) return;
    setSubmitting(true);
    const location: EventLocation | undefined = locationName.trim()
      ? {
          name: locationName.trim(),
          address: locationAddress.trim() || undefined,
        }
      : undefined;
    const input: CreateEventInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startAt: startIso,
      location,
      background,
      font,
      accent,
    };
    const evt = await createEvent(input);
    router.push(`/events/${evt.id}?created=1`);
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12 grid lg:grid-cols-[1fr_420px] gap-10">
      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onComplete={() => setSignInOpen(false)}
        title="Welcome to Invited"
        subtitle="Tell us who's hosting. We won't ask for an iCloud — just a name guests will recognize."
      />

      <div>
        {/* Steps header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (step === 0 ? router.back() : setStep((step - 1) as Step))}
            className="text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Stepper current={step} />
          <div className="w-12" />
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {step === 0 && (
            <StepShell
              title="Pick a vibe"
              subtitle="Choose a background. You can change it any time."
            >
              <BackgroundPicker value={background} onChange={setBackground} />
            </StepShell>
          )}
          {step === 1 && (
            <StepShell
              title="The basics"
              subtitle="What's happening, and when?"
            >
              <div className="space-y-5">
                <Field label="Event name">
                  <TextInput
                    autoFocus
                    placeholder="Rooftop Birthday"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field
                  label="Description"
                  hint="Optional. Tell guests what to expect."
                >
                  <Textarea
                    rows={3}
                    placeholder="Bring good vibes (and a sweater)."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date">
                    <DatePicker value={date} onChange={setDate} />
                  </Field>
                  <Field label="Time">
                    <TimePicker value={time} onChange={setTime} />
                  </Field>
                </div>
                <Field
                  label="Location"
                  hint="A map and weather forecast will be added for you."
                >
                  <TextInput
                    placeholder="The Skyline Loft"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                  />
                </Field>
                <Field label="Address">
                  <TextInput
                    placeholder="212 Mercer St, New York"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                  />
                </Field>
              </div>
            </StepShell>
          )}
          {step === 2 && (
            <StepShell
              title="Make it yours"
              subtitle="Font and accent set the tone."
            >
              <div className="space-y-6">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium">
                    Font
                  </div>
                  <div className="mt-2">
                    <FontPicker value={font} onChange={setFont} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium">
                    Accent
                  </div>
                  <div className="mt-3">
                    <AccentPicker value={accent} onChange={setAccent} />
                  </div>
                </div>
              </div>
            </StepShell>
          )}
          {step === 3 && (
            <StepShell
              title="Looking great"
              subtitle="One last look before you send it out."
            >
              <ReviewList
                items={[
                  { k: "Title", v: title || "—" },
                  { k: "Description", v: description || "—" },
                  { k: "Date", v: new Date(startIso).toLocaleString() },
                  {
                    k: "Location",
                    v: locationName
                      ? `${locationName}${locationAddress ? ` · ${locationAddress}` : ""}`
                      : "—",
                  },
                  { k: "Font", v: font },
                ]}
              />
            </StepShell>
          )}
        </motion.div>

        <div className="mt-8 flex items-center justify-end gap-2">
          {step < 3 ? (
            <Button
              type="button"
              onClick={() => canAdvance(step) && setStep((step + 1) as Step)}
              disabled={!canAdvance(step)}
              style={{ background: accent }}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
              style={{ background: accent }}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create invitation
            </Button>
          )}
        </div>
      </div>

      {/* Live preview */}
      <aside className="lg:sticky lg:top-24 self-start">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-3">
          Live preview
        </div>
        <InvitationCard
          floating
          title={title || "Your event"}
          hostName={user?.name || "You"}
          startAt={startIso}
          background={background}
          font={font}
          description={description}
          location={
            locationName
              ? { name: locationName, address: locationAddress || undefined }
              : undefined
          }
        />
        <div className="mt-3 text-xs text-subtle text-center">
          Updates as you build.
        </div>
      </aside>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">
        {title}
      </h1>
      <p className="mt-1 text-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5">
      {STEPS.map((s) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center gap-1.5 text-xs">
            <span
              className={
                "h-1.5 w-7 rounded-full transition-colors " +
                (active
                  ? "bg-accent"
                  : done
                    ? "bg-[var(--foreground-secondary)]"
                    : "bg-hairline")
              }
            />
          </div>
        );
      })}
    </div>
  );
}

function ReviewList({ items }: { items: { k: string; v: string }[] }) {
  return (
    <Card className="overflow-hidden shadow-none p-0 divide-y divide-hairline">
      {items.map((i) => (
        <div key={i.k} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted">{i.k}</span>
          <span className="text-sm font-medium text-right max-w-[60%] truncate">{i.v}</span>
        </div>
      ))}
    </Card>
  );
}
