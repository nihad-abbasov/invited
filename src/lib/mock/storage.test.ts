import { describe, expect, it } from "vitest";
import { shortCode, uid } from "./storage";

describe("shortCode", () => {
  it("is 6 characters from the unambiguous alphabet", () => {
    const code = shortCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("excludes ambiguous glyphs (0, O, 1, I)", () => {
    for (let i = 0; i < 200; i++) {
      expect(shortCode()).not.toMatch(/[01OI]/);
    }
  });

  it("is reasonably unique across many calls", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(shortCode());
    // Collisions are statistically negligible over 1k draws from 32^6 space.
    expect(seen.size).toBeGreaterThan(995);
  });
});

describe("uid", () => {
  it("applies the given prefix", () => {
    expect(uid("evt_")).toMatch(/^evt_/);
  });

  it("produces distinct ids", () => {
    expect(uid("g_")).not.toBe(uid("g_"));
  });
});
