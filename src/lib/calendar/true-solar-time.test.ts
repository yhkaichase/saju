import { describe, expect, it } from "vitest";

import {
  equationOfTimeMinutes,
  SEOUL_LONGITUDE,
  toTrueSolarWallClock,
  trueSolarOffsetMinutes,
} from "./true-solar-time";

describe("equationOfTimeMinutes — 균시차", () => {
  // 알려진 균시차 극값/영점(천문 표준값)과 ±0.5분 이내로 일치해야 한다.
  const cases: Array<[string, number]> = [
    ["2024-02-11T12:00:00Z", -14.2], // 연중 최소 부근
    ["2024-11-03T12:00:00Z", 16.4], // 연중 최대 부근
    ["2024-04-15T12:00:00Z", 0], // 영점
    ["2024-06-13T12:00:00Z", 0], // 영점
  ];
  it.each(cases)("%s ≈ %f분", (iso, expected) => {
    expect(equationOfTimeMinutes(new Date(iso))).toBeCloseTo(expected, 0);
  });
});

describe("trueSolarOffsetMinutes — 경도보정 + 균시차", () => {
  it("서울은 경도보정이 약 −32.1분", () => {
    // 균시차 ~0인 날(4/15)에는 총보정 ≈ 경도보정.
    const offset = trueSolarOffsetMinutes(new Date("2024-04-15T03:00:00Z"), SEOUL_LONGITUDE);
    expect(offset).toBeCloseTo(-32.1, 0);
  });

  it("표준 자오선(135°)에서는 경도보정 0 → 총보정 = 균시차", () => {
    const utc = new Date("2024-11-03T03:00:00Z");
    const offset = trueSolarOffsetMinutes(utc, 135);
    expect(offset).toBeCloseTo(equationOfTimeMinutes(utc), 5);
  });
});

describe("toTrueSolarWallClock — 보정된 벽시계", () => {
  it("서울 2019-09-07 14:50 → 약 14:20 (여전히 未時 구간)", () => {
    const corrected = toTrueSolarWallClock(
      { year: 2019, month: 9, day: 7, hour: 14, minute: 50 },
      SEOUL_LONGITUDE,
    );
    expect(corrected.year).toBe(2019);
    expect(corrected.month).toBe(9);
    expect(corrected.day).toBe(7);
    expect(corrected.hour).toBe(14);
    // −32분(경도) + 균시차(9월 초 ≈ +2분) ≈ −30분 → 14:20 부근.
    expect(corrected.minute).toBeGreaterThanOrEqual(18);
    expect(corrected.minute).toBeLessThanOrEqual(22);
  });

  it("자정 직후 출생은 보정으로 전날로 이월된다(일주 경계에 영향)", () => {
    // 00:10 KST 서울 → 약 −32분 → 전날 23:3x.
    const corrected = toTrueSolarWallClock(
      { year: 2020, month: 4, day: 15, hour: 0, minute: 10 },
      SEOUL_LONGITUDE,
    );
    expect(corrected.day).toBe(14);
    expect(corrected.hour).toBe(23);
  });
});
