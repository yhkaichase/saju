import { describe, expect, it } from "vitest";

import { analyzeSoundElements, relationBetween, soundElementOf } from "./sound-element";

describe("soundElementOf — 자음 발음오행", () => {
  it("牙·舌·齒는 학파 무관 고정 (木·火·金)", () => {
    expect(soundElementOf("ㄱ")).toBe("木");
    expect(soundElementOf("ㅋ")).toBe("木");
    expect(soundElementOf("ㄴ")).toBe("火");
    expect(soundElementOf("ㄹ")).toBe("火");
    expect(soundElementOf("ㅅ")).toBe("金");
    expect(soundElementOf("ㅈ")).toBe("金");
  });

  it("주류(술가): 脣 ㅁㅂㅍ=水, 喉 ㅇㅎ=土", () => {
    expect(soundElementOf("ㅁ", "sulga")).toBe("水");
    expect(soundElementOf("ㅂ", "sulga")).toBe("水");
    expect(soundElementOf("ㅇ", "sulga")).toBe("土");
    expect(soundElementOf("ㅎ", "sulga")).toBe("土");
  });

  it("해례본: 脣 ㅁㅂㅍ=土, 喉 ㅇㅎ=水 (土↔水 반전)", () => {
    expect(soundElementOf("ㅁ", "haerye")).toBe("土");
    expect(soundElementOf("ㅇ", "haerye")).toBe("水");
    expect(soundElementOf("ㅎ", "haerye")).toBe("水");
  });

  it("겹받침은 첫 자음으로 환원 (ㄺ→ㄹ=火)", () => {
    expect(soundElementOf("ㄺ")).toBe("火");
    expect(soundElementOf("ㅄ")).toBe("水"); // ㅂ→水(술가)
  });
});

describe("relationBetween — 상생/상극/비화", () => {
  it("木生火 = 생, 木剋土 = 극, 같으면 비화", () => {
    expect(relationBetween("木", "火")).toBe("생");
    expect(relationBetween("木", "土")).toBe("극");
    expect(relationBetween("水", "水")).toBe("비화");
  });
});

describe("analyzeSoundElements — 이름 발음오행 흐름", () => {
  it("초성 상생 흐름이면 길 (술가 기준)", () => {
    // 강민호: ㄱ(木)·ㅁ(水)·ㅎ(土). 木-水: 水生木(생), 水-土: 土剋水(극) → 극 있어 흉.
    const r = analyzeSoundElements("강민호");
    expect(r.elements).toEqual(["木", "水", "土"]);
    expect(r.relations).toEqual(["생", "극"]);
    expect(r.isAuspicious).toBe(false);
  });

  it("상극 없는 흐름은 길", () => {
    // 김나래: ㄱ(木)·ㄴ(火)·ㄹ(火). 木生火(생), 火-火(비화) → 극 없음 → 길.
    const r = analyzeSoundElements("김나래");
    expect(r.elements).toEqual(["木", "火", "火"]);
    expect(r.isAuspicious).toBe(true);
  });

  it("학파(haerye)에 따라 결과가 달라진다", () => {
    // 박서준 초성 ㅂ·ㅅ·ㅈ. 술가: 水·金·金, 해례: 土·金·金. 둘 다 극 없음이지만 오행 자체가 다름.
    expect(analyzeSoundElements("박서준", { system: "sulga" }).elements).toEqual([
      "水",
      "金",
      "金",
    ]);
    expect(analyzeSoundElements("박서준", { system: "haerye" }).elements).toEqual([
      "土",
      "金",
      "金",
    ]);
  });

  it("종성 포함 옵션은 받침까지 흐름에 넣는다", () => {
    // 김: 초성 ㄱ(木) + 종성 ㅁ(水, 술가).
    const r = analyzeSoundElements("김", { includeJongseong: true });
    expect(r.elements).toEqual(["木", "水"]);
  });
});
