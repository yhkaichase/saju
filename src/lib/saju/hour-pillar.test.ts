import { describe, expect, it } from "vitest";

import { calculateHourPillar, hourToBranchIndex } from "./hour-pillar";

describe("hourToBranchIndex — 시지 경계 (시작 포함 / 끝 배타)", () => {
  const cases: Array<[number, number, number, string]> = [
    [23, 0, 0, "子 시작(23:00)"],
    [23, 59, 0, "子(야자시 끝)"],
    [0, 0, 0, "子(자정)"],
    [0, 59, 0, "子(조자시 끝)"],
    [1, 0, 1, "丑 시작(01:00, 경계)"],
    [2, 59, 1, "丑 끝"],
    [11, 0, 6, "午 시작(정오)"],
    [12, 59, 6, "午 끝"],
    [13, 0, 7, "未 시작(13:00, 경계)"],
    [21, 0, 11, "亥 시작"],
    [22, 59, 11, "亥 끝"],
  ];

  for (const [hour, minute, expected, label] of cases) {
    it(`${label} → index ${expected}`, () => {
      expect(hourToBranchIndex(hour, minute)).toBe(expected);
    });
  }
});

/**
 * 골든 테스트 — 시주(時柱).
 *
 * 오서둔(五鼠遁) 닫힌 공식 + 일주 SSOT 정책을 end-to-end로 검증.
 * 출처: saju-domain-expert 에이전트(算准网/知乎 원전 가결 교차확인).
 * (커밋 전 KASI 만세력으로 G1·G5 육안 대조 권장)
 */
describe("calculateHourPillar — 골든 케이스", () => {
  const cases: Array<{
    label: string;
    input: Parameters<typeof calculateHourPillar>[0];
    stem: string;
    branch: string;
  }> = [
    {
      label: "G1 2024-01-01 12:30 (甲일 午시) → 庚午",
      input: { year: 2024, month: 1, day: 1, hour: 12, minute: 30 },
      stem: "庚",
      branch: "午",
    },
    {
      label: "G2 2024-01-01 00:30 조자시 midnight=당일(甲일) → 甲子",
      input: { year: 2024, month: 1, day: 1, hour: 0, minute: 30 },
      stem: "甲",
      branch: "子",
    },
    {
      label: "G3 2024-01-01 23:30 야자시 midnight=당일(甲일) → 甲子",
      input: { year: 2024, month: 1, day: 1, hour: 23, minute: 30 },
      stem: "甲",
      branch: "子",
    },
    {
      label: "G4 2024-01-02 12:30 (乙일 午시) → 壬午 (일간 차이로 오서둔 다름)",
      input: { year: 2024, month: 1, day: 2, hour: 12, minute: 30 },
      stem: "壬",
      branch: "午",
    },
    {
      label: "G5 1952-11-29 23:45 (己일 야자시 midnight) → 甲子",
      input: { year: 1952, month: 11, day: 29, hour: 23, minute: 45 },
      stem: "甲",
      branch: "子",
    },
    {
      label: "B2 2024-01-01 01:00 정확히 축시 시작 (甲일) → 乙丑",
      input: { year: 2024, month: 1, day: 1, hour: 1, minute: 0 },
      stem: "乙",
      branch: "丑",
    },
  ];

  for (const c of cases) {
    it(c.label, () => {
      expect(calculateHourPillar(c.input)).toEqual({
        heavenlyStem: c.stem,
        earthlyBranch: c.branch,
      });
    });
  }

  it("G6 정책 분기: 동일 출생(1952-11-29 23:45)도 zishi23이면 익일(庚일)→丙子", () => {
    expect(
      calculateHourPillar({
        year: 1952,
        month: 11,
        day: 29,
        hour: 23,
        minute: 45,
        dayBoundaryPolicy: "zishi23",
      }),
    ).toEqual({ heavenlyStem: "丙", earthlyBranch: "子" });
  });
});
