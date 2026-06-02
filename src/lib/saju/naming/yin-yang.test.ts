import { describe, expect, it } from "vitest";

import { analyzeYinYang, yinYangOfStroke } from "./yin-yang";

describe("yinYangOfStroke", () => {
  it("홀수=陽, 짝수=陰", () => {
    expect(yinYangOfStroke(7)).toBe("陽");
    expect(yinYangOfStroke(8)).toBe("陰");
  });
});

describe("analyzeYinYang", () => {
  it("음양 섞이면 길 (7·5·8 = 陽陽陰)", () => {
    const r = analyzeYinYang([7, 5, 8]);
    expect(r.marks).toEqual(["陽", "陽", "陰"]);
    expect(r.isAuspicious).toBe(true);
  });

  it("순양(모두 홀)은 흉", () => {
    expect(analyzeYinYang([7, 5, 3]).isAuspicious).toBe(false);
  });

  it("순음(모두 짝)은 흉", () => {
    expect(analyzeYinYang([8, 6, 12]).isAuspicious).toBe(false);
  });

  it("빈 입력은 오류", () => {
    expect(() => analyzeYinYang([])).toThrow();
  });
});
