import type { InvitedEvent, User } from "../types";
import { shortCode, uid } from "./storage";

/**
 * Sample data so the app feels alive on first run.
 * Deleted as soon as the user creates a real event of their own.
 */

export function buildSeedEvents(currentUser: User): InvitedEvent[] {
  const now = Date.now();
  const inDays = (n: number) => new Date(now + n * 86_400_000).toISOString();

  const sampleHost: User = {
    id: uid("user_"),
    name: "Olivia Bennett",
    avatar: "OB",
    color: "#ff2d55",
  };

  return [
    {
      id: uid("evt_"),
      shortCode: shortCode(),
      title: "Rooftop Birthday",
      description:
        "Come help me celebrate another trip around the sun. Bring good vibes (and a sweater—it gets breezy up there).",
      startAt: inDays(6),
      hostId: currentUser.id,
      hostName: currentUser.name,
      location: {
        name: "The Skyline Loft",
        address: "212 Mercer St, New York, NY",
        lat: 40.7282,
        lng: -73.9971,
      },
      background: { kind: "emoji", emoji: "🎂", gradient: ["#ff7a59", "#ff2d92"] },
      font: "display",
      accent: "#ff2d92",
      guests: [
        {
          id: uid("g_"),
          user: sampleHost,
          status: "going",
          plusOnes: 1,
          respondedAt: inDays(-1),
        },
        {
          id: uid("g_"),
          user: { id: uid("u_"), name: "Marcus Chen", avatar: "MC", color: "#0a84ff" },
          status: "going",
          plusOnes: 0,
          respondedAt: inDays(-1),
        },
        {
          id: uid("g_"),
          user: { id: uid("u_"), name: "Priya Shah", avatar: "PS", color: "#af52de" },
          status: "maybe",
          plusOnes: 0,
        },
        {
          id: uid("g_"),
          user: { id: uid("u_"), name: "Jordan Lee", avatar: "JL", color: "#34c759" },
          status: "pending",
          plusOnes: 0,
        },
      ],
      messages: [
        {
          id: uid("m_"),
          authorId: currentUser.id,
          authorName: currentUser.name,
          body: "Pro tip: there's free street parking after 7pm on Mercer. See you there!",
          createdAt: inDays(-0.5),
        },
      ],
      playlist: [
        { id: uid("t_"), title: "As It Was", artist: "Harry Styles", addedBy: "Marcus", durationMs: 167000, artwork: "🎧" },
        { id: uid("t_"), title: "Espresso", artist: "Sabrina Carpenter", addedBy: "Priya", durationMs: 175000, artwork: "☕" },
        { id: uid("t_"), title: "Flowers", artist: "Miley Cyrus", addedBy: "Olivia", durationMs: 200000, artwork: "🌸" },
      ],
      album: [],
      createdAt: inDays(-2),
    },
    {
      id: uid("evt_"),
      shortCode: shortCode(),
      title: "Sunday Pasta Night",
      description:
        "Homemade ravioli, too much wine, and a movie afterwards. Veggie-friendly. Show up hungry.",
      startAt: inDays(2),
      hostId: currentUser.id,
      hostName: currentUser.name,
      location: { name: "My place", address: "Brooklyn, NY" },
      background: { kind: "color", gradient: ["#34c759", "#0a84ff"] },
      font: "rounded",
      accent: "#34c759",
      guests: [
        {
          id: uid("g_"),
          user: { id: uid("u_"), name: "Sam Rivera", avatar: "SR", color: "#ff9500" },
          status: "going",
          plusOnes: 1,
          respondedAt: inDays(-0.5),
        },
        {
          id: uid("g_"),
          user: { id: uid("u_"), name: "Ana Sosa", avatar: "AS", color: "#ff2d55" },
          status: "going",
          plusOnes: 0,
          respondedAt: inDays(-0.3),
        },
      ],
      messages: [],
      playlist: [
        { id: uid("t_"), title: "La Vie en Rose", artist: "Édith Piaf", addedBy: "Olivia", durationMs: 192000, artwork: "🌹" },
      ],
      album: [],
      createdAt: inDays(-1),
    },
  ];
}
