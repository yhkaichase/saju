import { describe, expect, it } from "vitest";

import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "./constants";
import {
  ALL_BRANCHES_MAPPED,
  ALL_STEMS_MAPPED,
  EARTHLY_BRANCH_ELEMENT,
  EARTHLY_BRANCH_YIN_YANG,
  FIVE_ELEMENT_GENERATES,
  FIVE_ELEMENT_OVERCOMES,
  generates,
  HEAVENLY_STEM_ELEMENT,
  HEAVENLY_STEM_YIN_YANG,
  overcomes,
} from "./five-elements";

describe("오행/음양 매핑", () => {
  it("천간 10개·지지 12개 모두 매핑됨", () => {
    expect(ALL_STEMS_MAPPED).toBe(true);
    expect(ALL_BRANCHES_MAPPED).toBe(true);
  });

  it("천간 오행: 甲乙木 丙丁火 戊己土 庚辛金 壬癸水", () => {
    expect(HEAVENLY_STEMS.map((s) => HEAVENLY_STEM_ELEMENT[s]).join("")).toBe(
      "木木火火土土金金水水",
    );
  });

  it("천간 음양은 陽陰 교대", () => {
    expect(HEAVENLY_STEMS.map((s) => HEAVENLY_STEM_YIN_YANG[s]).join("")).toBe(
      "陽陰陽陰陽陰陽陰陽陰",
    );
  });

  it("지지 오행: 水土木木土火火土金金土水", () => {
    expect(EARTHLY_BRANCHES.map((b) => EARTHLY_BRANCH_ELEMENT[b]).join("")).toBe(
      "水土木木土火火土金金土水",
    );
  });

  it("지지 음양은 본기(用) 기준 — 子午=陰, 巳亥=陽으로 체와 갈림", () => {
    // 子(癸陰) 丑(己陰) 寅(甲陽) 卯(乙陰) 辰(戊陽) 巳(丙陽) 午(丁陰)
    // 未(己陰) 申(庚陽) 酉(辛陰) 戌(戊陽) 亥(壬陽)
    expect(EARTHLY_BRANCHES.map((b) => EARTHLY_BRANCH_YIN_YANG[b]).join("")).toBe(
      "陰陰陽陰陽陽陰陰陽陰陽陽",
    );
  });
});

describe("오행 생극", () => {
  it("상생: 木→火→土→金→水→木", () => {
    expect(FIVE_ELEMENT_GENERATES).toEqual({ 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" });
    expect(generates("木", "火")).toBe(true);
    expect(generates("木", "土")).toBe(false);
  });

  it("상극: 木→土→水→火→金→木", () => {
    expect(FIVE_ELEMENT_OVERCOMES).toEqual({ 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" });
    expect(overcomes("木", "土")).toBe(true);
    expect(overcomes("木", "火")).toBe(false);
  });
});
