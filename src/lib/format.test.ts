import { describe, expect, it } from "vitest";
import {
  combineDateAndTime,
  formatDuration,
  formatEventDate,
  formatRelative,
  formatShortDate,
  splitIsoForInputs,
} from "./format";

describe("formatEventDate", () => {
  it("formats a valid ISO date in 24-hour time", () => {
    // 2026-06-10T19:30 local time, expressed in UTC for determinism.
    const iso = new Date(2026, 5, 10, 19, 30).toISOString();
    const { weekday, date, time } = formatEventDate(iso);
    expect(weekday).toBe("Wednesday");
    expect(date).toBe("June 10, 2026");
    expect(time).toBe("19:30");
  });

  it("never renders an AM/PM marker (24-hour format)", () => {
    const iso = new Date(2026, 0, 1, 8, 5).toISOString();
    const { time } = formatEventDate(iso);
    expect(time).toBe("08:05");
    expect(time.toLowerCase()).not.toContain("am");
    expect(time.toLowerCase()).not.toContain("pm");
  });

  it("returns placeholders for an invalid date", () => {
    const out = formatEventDate("not-a-date");
    expect(out).toEqual({ weekday: "—", date: "Pick a date", time: "" });
  });
});

describe("formatShortDate", () => {
  it("formats month and day", () => {
    const iso = new Date(2026, 11, 25, 12, 0).toISOString();
    expect(formatShortDate(iso)).toBe("Dec 25");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatShortDate("nope")).toBe("");
  });
});

describe("formatRelative", () => {
  it("describes the near future", () => {
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(inTwoHours)).toBe("in 2 hours");
  });

  it("describes the near past", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelative(threeDaysAgo)).toBe("3 days ago");
  });

  it("uses singular units for one", () => {
    const inOneHour = new Date(Date.now() + 60 * 60 * 1000 + 1000).toISOString();
    expect(formatRelative(inOneHour)).toBe("in 1 hour");
  });

  it("collapses sub-minute differences", () => {
    expect(formatRelative(new Date(Date.now() + 5_000).toISOString())).toBe("in a moment");
    expect(formatRelative(new Date(Date.now() - 5_000).toISOString())).toBe("just now");
  });
});

describe("formatDuration", () => {
  it("formats minutes and seconds with zero padding", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(9_000)).toBe("0:09");
    expect(formatDuration(125_000)).toBe("2:05");
  });
});

describe("combineDateAndTime / splitIsoForInputs", () => {
  it("returns an empty string when no date is supplied", () => {
    expect(combineDateAndTime("", "19:00")).toBe("");
  });

  it("defaults to 19:00 when time is missing", () => {
    const iso = combineDateAndTime("2026-06-10", "");
    const { time } = splitIsoForInputs(iso);
    expect(time).toBe("19:00");
  });

  it("round-trips a date and time through ISO", () => {
    const date = "2026-06-10";
    const time = "08:05";
    const iso = combineDateAndTime(date, time);
    expect(splitIsoForInputs(iso)).toEqual({ date, time });
  });
});
