import { describe, expect, it } from "vitest";

import { formatDay } from "./weekdays";

describe("formatDay", () => {
  it("maps 0-6 to Sunday-Saturday", () => {
    expect(formatDay(0)).toBe("Sunday");
    expect(formatDay(1)).toBe("Monday");
    expect(formatDay(6)).toBe("Saturday");
  });

  it("falls back for out-of-range values", () => {
    expect(formatDay(7)).toBe("Day 7");
    expect(formatDay(-1)).toBe("Day -1");
  });
});
