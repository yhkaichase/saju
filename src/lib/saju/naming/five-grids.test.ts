import { describe, expect, it } from "vitest";

import { calculateFiveGrids } from "./five-grids";

describe("calculateFiveGrids — 오격", () => {
  it("골든 李正武(7·5·8) → 天7·人12·地13·外15·總20", () => {
    expect(calculateFiveGrids([7], [5, 8])).toEqual({
      cheon: 7,
      in: 12,
      ji: 13,
      oe: 15,
      chong: 20,
    });
  });

  it("골든 洪吉童(10·6·12) → 天10·人16·地18·外22·總28", () => {
    expect(calculateFiveGrids([10], [6, 12])).toEqual({
      cheon: 10,
      in: 16,
      ji: 18,
      oe: 22,
      chong: 28,
    });
  });

  it("외자 이름: 地格·外格에 가성수 1을 더한다", () => {
    // 성 金(8) + 이름 한 자 民(5): 天8, 人8+5=13, 地5+1=6, 外8+1=9, 總13.
    expect(calculateFiveGrids([8], [5])).toEqual({
      cheon: 8,
      in: 13,
      ji: 6,
      oe: 9,
      chong: 13,
    });
  });

  it("복성(두 자 성): 天格은 성 두 자 합, 外格은 성 첫자+이름 끝자", () => {
    // 南宮(9·10) + 民秀(5·7): 天9+10=19, 人10+5=15, 地5+7=12, 外9+7=16, 總31.
    expect(calculateFiveGrids([9, 10], [5, 7])).toEqual({
      cheon: 19,
      in: 15,
      ji: 12,
      oe: 16,
      chong: 31,
    });
  });

  it("빈 입력은 오류", () => {
    expect(() => calculateFiveGrids([], [5, 8])).toThrow();
    expect(() => calculateFiveGrids([7], [])).toThrow();
  });
});
