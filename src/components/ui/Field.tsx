"use client";

import { cn } from "@/lib/cn";
import { Label } from "./Label";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
    </label>
  );
}

export { Input as TextInput } from "./Input";
export { Textarea } from "./Textarea";
