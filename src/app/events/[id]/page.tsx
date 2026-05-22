"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { EventView } from "@/components/event/EventView";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const created = search.get("created") === "1";
  return <EventView eventId={id} celebrate={created} />;
}
