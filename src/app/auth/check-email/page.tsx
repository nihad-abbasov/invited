import { Button } from "@/components/ui/Button";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-(--green) text-white grid place-items-center">
        <MailCheck className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        Check your email
      </h1>
      <p className="mt-2 text-muted">
        We sent you a sign-in link. Open it on this device to finish signing in.
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
