import { describe, expect, it } from "vitest";

import { calculateMonthPillar, sunLongitudeToMonthBranchIndex } from "./month-pillar";

describe("sunLongitudeToMonthBranchIndex — 절기 기준 월지", () => {
  // 입춘 315°=寅(2), 30°씩 진행. 子=0, 丑=1.
  const cases: Array<[number, number, string]> = [
    [315, 2, "寅(입춘 직후)"],
    [344, 2, "寅(경칩 직전)"],
    [345, 3, "卯(경칩)"],
    [15, 4, "辰(청명)"],
    [75, 6, "午(망종)"],
    [255, 0, "子(대설)"],
    [285, 1, "丑(소한)"],
    [314, 1, "丑(입춘 직전)"],
  ];

  for (const [lon, expected, label] of cases) {
    it(`λ=${lon}° → ${label} (index ${expected})`, () => {
      expect(sunLongitudeToMonthBranchIndex(lon)).toBe(expected);
    });
  }
});

/**
 * 골든 테스트 — 월주(月柱).
 *
 * 닫힌 공식 monthStemIndex = (yearStemIndex*2 + monthBranchIndex) % 10 +
 * 입춘 경계 연간 SSOT를 end-to-end 검증. 절입 시각은 astronomy-engine 계산값.
 * (커밋 전 KASI 만세력으로 G2·G4 육안 대조 권장)
 */
describe("calculateMonthPillar — 골든 케이스", () => {
  const cases: Array<{
    label: string;
    input: Parameters<typeof calculateMonthPillar>[0];
    stem: string;
    branch: string;
  }> = [
    {
      label: "G1 2024-02-04 17:00 입춘 직전 → 癸丑 (전년 癸卯 + 丑월)",
      input: { year: 2024, month: 2, day: 4, hour: 17, minute: 0 },
      stem: "癸",
      branch: "丑",
    },
    {
      label: "G2 2024-02-04 18:00 입춘 직후 → 丙寅 (甲辰년 寅월)",
      input: { year: 2024, month: 2, day: 4, hour: 18, minute: 0 },
      stem: "丙",
      branch: "寅",
    },
    {
      label: "G3 2024-03-05 10:00 경칩 직전 → 丙寅 (아직 寅월)",
      input: { year: 2024, month: 3, day: 5, hour: 10, minute: 0 },
      stem: "丙",
      branch: "寅",
    },
    {
      label: "G4 2024-03-05 12:00 경칩 직후 → 丁卯",
      input: { year: 2024, month: 3, day: 5, hour: 12, minute: 0 },
      stem: "丁",
      branch: "卯",
    },
    {
      label: "G5 1984-06-15 12:00 → 庚午 (甲子년 午월)",
      input: { year: 1984, month: 6, day: 15, hour: 12 },
      stem: "庚",
      branch: "午",
    },
    {
      label: "G6 2023-12-30 12:00 → 壬子 (癸卯년 子월, 연말 걸침)",
      input: { year: 2023, month: 12, day: 30, hour: 12 },
      stem: "壬",
      branch: "子",
    },
  ];

  for (const c of cases) {
    it(c.label, () => {
      expect(calculateMonthPillar(c.input)).toEqual({
        heavenlyStem: c.stem,
        earthlyBranch: c.branch,
      });
    });
  }
});

/**
 * 오호둔(五虎遁) — 연간 5쌍별 寅월 천간 전수 검증.
 * 입춘 직후(2/20)는 확실히 寅월이므로 연간만 바꿔 寅월 천간을 확인.
 * 甲己→丙寅, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅.
 */
describe("calculateMonthPillar — 오호둔 연간 5쌍 (寅월)", () => {
  const cases: Array<[year: number, stem: string]> = [
    [2024, "丙"], // 甲辰년
    [2025, "戊"], // 乙巳년
    [2026, "庚"], // 丙午년
    [2027, "壬"], // 丁未년
    [2028, "甲"], // 戊申년
  ];

  for (const [year, stem] of cases) {
    it(`${year}년 2/20 寅월 천간 = ${stem}`, () => {
      expect(calculateMonthPillar({ year, month: 2, day: 20, hour: 12 })).toEqual({
        heavenlyStem: stem,
        earthlyBranch: "寅",
      });
    });
  }
});
