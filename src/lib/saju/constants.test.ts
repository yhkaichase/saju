import { describe, expect, it } from "vitest";

import { EARTHLY_BRANCHES, HEAVENLY_STEMS, SEXAGENARY_CYCLE, sexagenaryIndexOf } from "./constants";

describe("사주 기초 상수", () => {
  it("천간은 10개", () => {
    expect(HEAVENLY_STEMS).toHaveLength(10);
  });

  it("지지는 12개", () => {
    expect(EARTHLY_BRANCHES).toHaveLength(12);
  });

  it("60갑자는 60개이며 갑자(甲子)로 시작해 계해(癸亥)로 끝난다", () => {
    expect(SEXAGENARY_CYCLE).toHaveLength(60);
    expect(SEXAGENARY_CYCLE[0]).toEqual({ heavenlyStem: "甲", earthlyBranch: "子" });
    expect(SEXAGENARY_CYCLE[59]).toEqual({ heavenlyStem: "癸", earthlyBranch: "亥" });
  });

  it("60갑자 인덱스 역산이 일치한다", () => {
    expect(sexagenaryIndexOf("甲", "子")).toBe(0);
    expect(sexagenaryIndexOf("癸", "亥")).toBe(59);
    // 31번째(인덱스 30) = 갑오(甲午): 천간 30%10=0(甲), 지지 30%12=6(午)
    expect(SEXAGENARY_CYCLE[30]).toEqual({ heavenlyStem: "甲", earthlyBranch: "午" });
  });

  it("유효하지 않은 간지 조합은 -1", () => {
    // 甲(천간 0, 짝수)은 子寅辰午申戌(지지 짝수)과만 결합. 甲丑은 불가.
    expect(sexagenaryIndexOf("甲", "丑")).toBe(-1);
  });
});
