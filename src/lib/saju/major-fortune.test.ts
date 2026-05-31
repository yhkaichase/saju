import { describe, expect, it } from "vitest";

import { calculateMajorFortune, fortuneDirection } from "./major-fortune";

describe("fortuneDirection — 순행/역행", () => {
  it("陽男 = 순행 (甲년 male)", () => {
    expect(fortuneDirection("甲", "male")).toBe("forward");
  });
  it("陽女 = 역행 (甲년 female)", () => {
    expect(fortuneDirection("甲", "female")).toBe("backward");
  });
  it("陰男 = 역행 (乙년 male)", () => {
    expect(fortuneDirection("乙", "male")).toBe("backward");
  });
  it("陰女 = 순행 (乙년 female)", () => {
    expect(fortuneDirection("乙", "female")).toBe("forward");
  });
});

/**
 * 골든 테스트 — 대운(大運).
 *
 * 명식: 1984-06-15 12:30 KST (연주 甲子, 월주 庚午). 연간 甲=陽.
 * 절입 시각은 astronomy-engine 계산값. 대운수/간지는 닫힌 공식으로 산출.
 *
 * ⚠️ 대운수 반올림/0시작 경계 관례는 KASI 공식 만세력 대조 후 확정 예정.
 * 여기서는 기본 정책(round)과 정밀값을 함께 고정한다.
 */
describe("calculateMajorFortune — 골든", () => {
  const base = { year: 1984, month: 6, day: 15, hour: 12, minute: 30 } as const;

  it("陽男(순행): 월주 庚午 다음부터 辛未·壬申·癸酉, 대운수 7", () => {
    const r = calculateMajorFortune({ ...base, gender: "male" });
    expect(r.direction).toBe("forward");
    expect(r.fortuneStartAge).toBe(7);
    expect(r.fortuneStartAgePrecise).toBeCloseTo(7.264, 2);
    expect(r.periods.slice(0, 3).map((p) => p.pillar)).toEqual([
      { heavenlyStem: "辛", earthlyBranch: "未" },
      { heavenlyStem: "壬", earthlyBranch: "申" },
      { heavenlyStem: "癸", earthlyBranch: "酉" },
    ]);
  });

  it("陽女(역행): 월주 庚午 이전부터 己巳·戊辰·丁卯, 대운수 3", () => {
    const r = calculateMajorFortune({ ...base, gender: "female" });
    expect(r.direction).toBe("backward");
    expect(r.fortuneStartAge).toBe(3);
    expect(r.fortuneStartAgePrecise).toBeCloseTo(3.213, 2);
    expect(r.periods.slice(0, 3).map((p) => p.pillar)).toEqual([
      { heavenlyStem: "己", earthlyBranch: "巳" },
      { heavenlyStem: "戊", earthlyBranch: "辰" },
      { heavenlyStem: "丁", earthlyBranch: "卯" },
    ]);
  });

  it("대운 시작 나이는 10년 간격으로 증가한다", () => {
    const r = calculateMajorFortune({ ...base, gender: "male" });
    expect(r.periods[0].startAge).toBe(7);
    expect(r.periods[1].startAge).toBe(17);
    expect(r.periods[2].startAge).toBe(27);
  });

  it("반올림 정책 floor/ceil 옵션이 적용된다", () => {
    const floor = calculateMajorFortune({
      ...base,
      gender: "male",
      fortuneStartAgeRounding: "floor",
    });
    const ceil = calculateMajorFortune({
      ...base,
      gender: "male",
      fortuneStartAgeRounding: "ceil",
    });
    expect(floor.fortuneStartAge).toBe(7);
    expect(ceil.fortuneStartAge).toBe(8);
  });
});
