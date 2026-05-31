import { describe, expect, it } from "vitest";

import { calculateYearPillar, yearPillarFromSajuYear } from "./year-pillar";

describe("yearPillarFromSajuYear — 연간지 닫힌 공식", () => {
  const cases: Array<[number, string, string]> = [
    [1984, "甲", "子"],
    [1924, "甲", "子"],
    [2044, "甲", "子"],
    [2024, "甲", "辰"],
    [2023, "癸", "卯"],
    [2000, "庚", "辰"],
    [1900, "庚", "子"],
    [2025, "乙", "巳"],
  ];

  for (const [y, stem, branch] of cases) {
    it(`${y} → ${stem}${branch}`, () => {
      expect(yearPillarFromSajuYear(y)).toEqual({ heavenlyStem: stem, earthlyBranch: branch });
    });
  }
});

describe("calculateYearPillar — 입춘 경계", () => {
  // 2024 입춘 = 2024-02-04 17:26:50 KST (astronomy-engine 계산값).
  it("입춘 직전(2024-02-04 17:00)은 전년 癸卯", () => {
    expect(calculateYearPillar({ year: 2024, month: 2, day: 4, hour: 17, minute: 0 })).toEqual({
      heavenlyStem: "癸",
      earthlyBranch: "卯",
    });
  });

  it("입춘 직후(2024-02-04 18:00)는 甲辰", () => {
    expect(calculateYearPillar({ year: 2024, month: 2, day: 4, hour: 18, minute: 0 })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "辰",
    });
  });

  it("입춘 한참 전(2024-01-15)은 전년 癸卯", () => {
    expect(calculateYearPillar({ year: 2024, month: 1, day: 15, hour: 12 })).toEqual({
      heavenlyStem: "癸",
      earthlyBranch: "卯",
    });
  });

  it("입춘 이후 일반(1984-06-15)은 甲子", () => {
    expect(calculateYearPillar({ year: 1984, month: 6, day: 15, hour: 12 })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "子",
    });
  });
});
