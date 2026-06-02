import { describe, expect, it } from "vitest";

import { normalizeNumerology, numerologyOf } from "./numerology";

describe("normalizeNumerology — 81 초과 환원", () => {
  it("81 이하는 그대로", () => {
    expect(normalizeNumerology(1)).toBe(1);
    expect(normalizeNumerology(81)).toBe(81);
  });
  it("81 초과는 (n−1)%80+1", () => {
    expect(normalizeNumerology(82)).toBe(2);
    expect(normalizeNumerology(100)).toBe(20);
    expect(normalizeNumerology(161)).toBe(1);
  });
  it("양수가 아니면 오류", () => {
    expect(() => normalizeNumerology(0)).toThrow();
  });
});

describe("numerologyOf — 길흉 조회", () => {
  it("대표 길수/흉수 분류", () => {
    expect(numerologyOf(1).fortune).toBe("길");
    expect(numerologyOf(3).fortune).toBe("길");
    expect(numerologyOf(2).fortune).toBe("흉");
    expect(numerologyOf(4).fortune).toBe("흉");
  });
  it("반길반흉 경계수", () => {
    expect(numerologyOf(26).fortune).toBe("반길반흉");
    expect(numerologyOf(38).fortune).toBe("반길반흉");
  });
  it("81 초과도 환원해 조회 (82 → 2 흉)", () => {
    expect(numerologyOf(82).fortune).toBe("흉");
  });
  it("모든 수리에 이름이 있다 (1~81)", () => {
    for (let n = 1; n <= 81; n++) {
      expect(numerologyOf(n).name.length).toBeGreaterThan(0);
    }
  });
});
