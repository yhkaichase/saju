import { describe, expect, it } from "vitest";

import { isRealCalendarDate, parseSajuInput } from "./input-schema";

describe("parseSajuInput", () => {
  const valid = { year: 1984, month: 6, day: 15, hour: 12, minute: 30, gender: "male" };

  it("유효한 입력을 통과시킨다", () => {
    const r = parseSajuInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.year).toBe(1984);
  });

  it("범위를 벗어난 월을 거른다", () => {
    const r = parseSajuInput({ ...valid, month: 13 });
    expect(r.ok).toBe(false);
  });

  it("존재하지 않는 날짜(2/30)를 거른다", () => {
    const r = parseSajuInput({ ...valid, month: 2, day: 30 });
    expect(r.ok).toBe(false);
  });

  it("잘못된 성별 값을 거른다", () => {
    const r = parseSajuInput({ ...valid, gender: "x" });
    expect(r.ok).toBe(false);
  });

  it("누락 필드를 거른다", () => {
    const r = parseSajuInput({ year: 1984 });
    expect(r.ok).toBe(false);
  });
});

describe("isRealCalendarDate", () => {
  it("윤년 2/29는 유효, 평년 2/29는 무효", () => {
    expect(isRealCalendarDate(2024, 2, 29)).toBe(true);
    expect(isRealCalendarDate(2023, 2, 29)).toBe(false);
  });

  it("4/31은 무효", () => {
    expect(isRealCalendarDate(2024, 4, 31)).toBe(false);
  });
});
