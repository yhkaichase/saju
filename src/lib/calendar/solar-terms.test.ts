import { describe, expect, it } from "vitest";

import { findSolarLongitudeTime, TWELVE_SOLAR_TERMS } from "./solar-terms";

/** UTC Date → KST 벽시계 표시용 헬퍼. */
function toKstParts(utc: Date): { year: number; month: number; day: number } {
  const kst = new Date(utc.getTime() + 9 * 3600 * 1000);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
  };
}

describe("TWELVE_SOLAR_TERMS", () => {
  it("12절기이며 입춘(315°)으로 시작한다", () => {
    expect(TWELVE_SOLAR_TERMS).toHaveLength(12);
    expect(TWELVE_SOLAR_TERMS[0]).toEqual({ name: "立春", longitude: 315 });
  });

  it("입춘부터 황경이 30°씩 증가한다(360 wrap)", () => {
    for (let i = 1; i < TWELVE_SOLAR_TERMS.length; i++) {
      const prev = TWELVE_SOLAR_TERMS[i - 1].longitude;
      const cur = TWELVE_SOLAR_TERMS[i].longitude;
      expect((cur - prev + 360) % 360).toBe(30);
    }
  });
});

describe("findSolarLongitudeTime — 입춘(315°)", () => {
  // 주의: 분 단위 정답은 KASI 공식값으로 별도 검증 예정(현재 라이브러리 계산값).
  // 여기서는 "입춘은 매년 2/3~2/4 KST"라는 견고한 사실만 회귀로 고정한다.
  const years = [2000, 2023, 2024, 2025];

  for (const y of years) {
    it(`${y} 입춘은 2/3 또는 2/4 (KST)`, () => {
      const utc = findSolarLongitudeTime(315, new Date(`${y}-01-25T00:00:00Z`), 20);
      expect(utc).not.toBeNull();
      const { month, day } = toKstParts(utc as Date);
      expect(month).toBe(2);
      expect([3, 4]).toContain(day);
    });
  }

  it("청명(15°)은 황경 wrap을 넘어 4월 초에 위치한다", () => {
    const utc = findSolarLongitudeTime(15, new Date("2024-03-25T00:00:00Z"), 20);
    expect(utc).not.toBeNull();
    const { month } = toKstParts(utc as Date);
    expect(month).toBe(4);
  });
});
