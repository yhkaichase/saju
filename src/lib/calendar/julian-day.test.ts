import { describe, expect, it } from "vitest";

import { gregorianToJulianDayNumber } from "./julian-day";

describe("gregorianToJulianDayNumber", () => {
  // 출처: Wikipedia, Julian day. 1949-10-01(일주 계산 앵커)의 JDN.
  it("앵커 날짜의 JDN", () => {
    expect(gregorianToJulianDayNumber(1949, 10, 1)).toBe(2433191);
  });

  it("세기 경계(윤년 규칙) — 1900 비윤년 / 2000 윤년", () => {
    expect(gregorianToJulianDayNumber(1900, 1, 1)).toBe(2415021);
    expect(gregorianToJulianDayNumber(2000, 1, 1)).toBe(2451545);
  });

  it("연속한 날짜는 JDN이 1씩 증가한다", () => {
    const a = gregorianToJulianDayNumber(2023, 12, 31);
    const b = gregorianToJulianDayNumber(2024, 1, 1);
    expect(b - a).toBe(1);
  });
});
