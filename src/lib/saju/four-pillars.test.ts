import { describe, expect, it } from "vitest";

import { calculateFourPillars } from "./four-pillars";

/**
 * 골든 테스트 — 사주(四柱) 통합.
 *
 * 네 기둥(연·월·일·시)이 한 입력에서 일관되게 산출되는지 end-to-end 검증.
 * 각 기둥의 개별 골든은 *-pillar.test.ts 참고. 여기서는 조합·정책 전파를 확인.
 */
describe("calculateFourPillars", () => {
  it("1984-06-15 12:30 (甲子년 午시) 전체 명식", () => {
    const result = calculateFourPillars({
      year: 1984,
      month: 6,
      day: 15,
      hour: 12,
      minute: 30,
    });
    expect(result).toEqual({
      yearPillar: { heavenlyStem: "甲", earthlyBranch: "子" },
      monthPillar: { heavenlyStem: "庚", earthlyBranch: "午" },
      dayPillar: { heavenlyStem: "庚", earthlyBranch: "辰" },
      hourPillar: { heavenlyStem: "壬", earthlyBranch: "午" },
    });
  });

  it("입춘 직후(2024-02-04 18:00)는 연주·월주가 신년 기준", () => {
    const result = calculateFourPillars({
      year: 2024,
      month: 2,
      day: 4,
      hour: 18,
      minute: 0,
    });
    expect(result.yearPillar).toEqual({ heavenlyStem: "甲", earthlyBranch: "辰" });
    expect(result.monthPillar).toEqual({ heavenlyStem: "丙", earthlyBranch: "寅" });
  });

  it("입춘 직전(2024-02-04 17:00)은 연주·월주가 전년 기준", () => {
    const result = calculateFourPillars({
      year: 2024,
      month: 2,
      day: 4,
      hour: 17,
      minute: 0,
    });
    expect(result.yearPillar).toEqual({ heavenlyStem: "癸", earthlyBranch: "卯" });
    // 癸卯년 丑월: 戊癸년 오호둔(甲寅頭) → 丑월 = 乙丑.
    expect(result.monthPillar).toEqual({ heavenlyStem: "乙", earthlyBranch: "丑" });
  });
});
