import { describe, expect, it } from "vitest";

import { tenGodOfBranch, tenGodOfStem } from "./ten-gods";

describe("tenGodOfStem — 천간 대상 십신", () => {
  // 일간 甲(陽木) 기준.
  it("甲 → 甲 = 比肩 (同오행·음양 같음)", () => {
    expect(tenGodOfStem("甲", "甲")).toBe("比肩");
  });
  it("甲 → 乙 = 劫財 (同오행·음양 다름)", () => {
    expect(tenGodOfStem("甲", "乙")).toBe("劫財");
  });
  it("甲 → 丙 = 食神 (木生火·음양 같음)", () => {
    expect(tenGodOfStem("甲", "丙")).toBe("食神");
  });
  it("甲 → 丁 = 傷官 (木生火·음양 다름)", () => {
    expect(tenGodOfStem("甲", "丁")).toBe("傷官");
  });
  it("甲 → 戊 = 偏財 (木剋土·음양 같음)", () => {
    expect(tenGodOfStem("甲", "戊")).toBe("偏財");
  });
  it("甲 → 己 = 正財 (木剋土·음양 다름)", () => {
    expect(tenGodOfStem("甲", "己")).toBe("正財");
  });
  it("甲 → 庚 = 偏官 (金剋木·음양 같음)", () => {
    expect(tenGodOfStem("甲", "庚")).toBe("偏官");
  });
  it("甲 → 辛 = 正官 (金剋木·음양 다름)", () => {
    expect(tenGodOfStem("甲", "辛")).toBe("正官");
  });
  it("甲 → 壬 = 偏印 (水生木·음양 같음)", () => {
    expect(tenGodOfStem("甲", "壬")).toBe("偏印");
  });
  it("甲 → 癸 = 正印 (水生木·음양 다름)", () => {
    expect(tenGodOfStem("甲", "癸")).toBe("正印");
  });

  // 일간 庚(陽金) 기준 — 官殺 케이스 교차검증.
  it("庚 → 丙 = 偏官 (火剋金·음양 같음)", () => {
    expect(tenGodOfStem("庚", "丙")).toBe("偏官");
  });
  it("庚 → 丁 = 正官 (火剋金·음양 다름)", () => {
    expect(tenGodOfStem("庚", "丁")).toBe("正官");
  });

  // 陰日干 乙(陰木) 기준 — 음양 비교가 음일간에서도 옳은지 독립 검증.
  it("乙 → 丙 = 傷官 (木生火·음양 다름)", () => {
    expect(tenGodOfStem("乙", "丙")).toBe("傷官");
  });
  it("乙 → 庚 = 正官 (金剋木·음양 다름)", () => {
    expect(tenGodOfStem("乙", "庚")).toBe("正官");
  });
  it("乙 → 辛 = 偏官 (金剋木·음양 같음)", () => {
    expect(tenGodOfStem("乙", "辛")).toBe("偏官");
  });
});

describe("tenGodOfBranch — 지지 대상 십신 (본기 음양)", () => {
  // 子午巳亥: 체(體)와 본기(用)가 갈리는 함정 케이스. 본기로 계산해야 정답.
  it("甲 → 子 = 正印 (子 본기 癸=陰水, 水生木·음양 다름)", () => {
    expect(tenGodOfBranch("甲", "子")).toBe("正印");
  });
  it("甲 → 午 = 傷官 (午 본기 丁=陰火, 木生火·음양 다름)", () => {
    expect(tenGodOfBranch("甲", "午")).toBe("傷官");
  });
  it("甲 → 巳 = 食神 (巳 본기 丙=陽火, 木生火·음양 같음)", () => {
    expect(tenGodOfBranch("甲", "巳")).toBe("食神");
  });
  it("甲 → 亥 = 偏印 (亥 본기 壬=陽水, 水生木·음양 같음)", () => {
    expect(tenGodOfBranch("甲", "亥")).toBe("偏印");
  });
  it("甲 → 寅 = 比肩 (寅 본기 甲=陽木, 同·음양 같음)", () => {
    expect(tenGodOfBranch("甲", "寅")).toBe("比肩");
  });
});
