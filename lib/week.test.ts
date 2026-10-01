import { describe, expect, it } from "vitest";
import { addDays, getVoteWeek, mondayOf, saturdayOf, seoulToday } from "./week";

describe("week utils (Asia/Seoul)", () => {
  it("seoulToday uses Seoul time, not UTC", () => {
    // 2026-10-03 16:00 UTC == 2026-10-04 01:00 KST
    expect(seoulToday(new Date("2026-10-03T16:00:00Z"))).toBe("2026-10-04");
  });

  it("mondayOf maps every weekday to that week's Monday", () => {
    // 2026-10-05 is a Monday
    for (const d of ["2026-10-05", "2026-10-07", "2026-10-10", "2026-10-11"]) {
      expect(mondayOf(d)).toBe("2026-10-05");
    }
    expect(mondayOf("2026-10-12")).toBe("2026-10-12");
  });

  it("getVoteWeek: Mon-Sat is the current week", () => {
    expect(getVoteWeek(new Date("2026-10-05T00:00:00+09:00"))).toBe("2026-10-05");
    expect(getVoteWeek(new Date("2026-10-10T23:59:00+09:00"))).toBe("2026-10-05");
  });

  it("getVoteWeek: Sunday rolls to next week", () => {
    expect(getVoteWeek(new Date("2026-10-11T00:00:00+09:00"))).toBe("2026-10-12");
    expect(getVoteWeek(new Date("2026-10-11T23:59:00+09:00"))).toBe("2026-10-12");
  });

  it("getVoteWeek: Sunday midnight boundary follows Seoul, not UTC", () => {
    // Saturday 23:30 KST is still Saturday UTC+0 14:30 -> current week
    expect(getVoteWeek(new Date("2026-10-10T14:30:00Z"))).toBe("2026-10-05");
    // Sunday 00:30 KST == Saturday 15:30 UTC -> next week
    expect(getVoteWeek(new Date("2026-10-10T15:30:00Z"))).toBe("2026-10-12");
  });

  it("saturdayOf and addDays handle month boundaries", () => {
    expect(saturdayOf("2026-10-05")).toBe("2026-10-10");
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  });
});
