import { describe, expect, it } from "vitest";

import { calculateDayPillar } from "./day-pillar";

/**
 * 골든 테스트 — 알려진 명식(일주) 사례.
 *
 * 앵커: 1949-10-01 = 甲子. 출처: Wikipedia *Sexagenary cycle* 일주 계산 예제,
 * Cantian.ai, 다수 중국 만년력 교차검증. 나머지는 동일 공식으로 파생.
 * (커밋 전 KASI 기반 만세력 1회 육안 대조 권장)
 */
describe("calculateDayPillar — 골든 케이스", () => {
  const cases: Array<{
    label: string;
    year: number;
    month: number;
    day: number;
    stem: string;
    branch: string;
  }> = [
    { label: "1949-10-01 앵커", year: 1949, month: 10, day: 1, stem: "甲", branch: "子" },
    { label: "1900-01-01 비윤년 세기", year: 1900, month: 1, day: 1, stem: "甲", branch: "戌" },
    { label: "2000-01-01 윤년 세기", year: 2000, month: 1, day: 1, stem: "戊", branch: "午" },
    { label: "2023-12-31 사이클 끝(59)", year: 2023, month: 12, day: 31, stem: "癸", branch: "亥" },
    { label: "2024-02-04 입춘 당일", year: 2024, month: 2, day: 4, stem: "戊", branch: "戌" },
    { label: "2025-01-01 연초", year: 2025, month: 1, day: 1, stem: "庚", branch: "午" },
  ];

  for (const c of cases) {
    it(c.label, () => {
      expect(calculateDayPillar({ year: c.year, month: c.month, day: c.day })).toEqual({
        heavenlyStem: c.stem,
        earthlyBranch: c.branch,
      });
    });
  }

  it("사이클 wrap: 2023-12-31(癸亥) 다음날은 甲子", () => {
    expect(calculateDayPillar({ year: 2024, month: 1, day: 1 })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "子",
    });
  });
});

describe("calculateDayPillar — 일자 경계 정책", () => {
  // 1949-10-01 = 甲子, 다음날 1949-10-02 = 乙丑.
  const day1 = { year: 1949, month: 10, day: 1 };

  it("midnight(기본): 22:30은 당일 일주(甲子)", () => {
    expect(calculateDayPillar({ ...day1, hour: 22 })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "子",
    });
  });

  it("midnight(기본): 23:30도 당일 일주(甲子) 유지", () => {
    expect(calculateDayPillar({ ...day1, hour: 23 })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "子",
    });
  });

  it("zishi23: 22:30은 아직 당일(甲子)", () => {
    expect(calculateDayPillar({ ...day1, hour: 22, dayBoundaryPolicy: "zishi23" })).toEqual({
      heavenlyStem: "甲",
      earthlyBranch: "子",
    });
  });

  it("zishi23: 23:30은 다음 일주(乙丑)로 넘어감", () => {
    expect(calculateDayPillar({ ...day1, hour: 23, dayBoundaryPolicy: "zishi23" })).toEqual({
      heavenlyStem: "乙",
      earthlyBranch: "丑",
    });
  });

  it("zishi23: 자시 경계가 월/연을 넘겨도 정상 (2023-12-31 23:00 → 甲子)", () => {
    expect(
      calculateDayPillar({
        year: 2023,
        month: 12,
        day: 31,
        hour: 23,
        dayBoundaryPolicy: "zishi23",
      }),
    ).toEqual({ heavenlyStem: "甲", earthlyBranch: "子" });
  });
});
