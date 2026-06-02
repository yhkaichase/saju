import { describe, expect, it } from "vitest";

import { decomposeName, decomposeSyllable, isHangulSyllable } from "./hangul";

describe("decomposeSyllable — 한글 자모 분해", () => {
  it("받침 없는 음절: 가 = ㄱ+ㅏ", () => {
    expect(decomposeSyllable("가")).toEqual({
      syllable: "가",
      choseong: "ㄱ",
      jungseong: "ㅏ",
      jongseong: "",
    });
  });

  it("받침 있는 음절: 김 = ㄱ+ㅣ+ㅁ", () => {
    expect(decomposeSyllable("김")).toEqual({
      syllable: "김",
      choseong: "ㄱ",
      jungseong: "ㅣ",
      jongseong: "ㅁ",
    });
  });

  it("겹받침: 닭 = ㄷ+ㅏ+ㄺ", () => {
    expect(decomposeSyllable("닭")).toEqual({
      syllable: "닭",
      choseong: "ㄷ",
      jungseong: "ㅏ",
      jongseong: "ㄺ",
    });
  });

  it("마지막 음절 힣 = ㅎ+ㅣ+ㅎ", () => {
    expect(decomposeSyllable("힣")).toEqual({
      syllable: "힣",
      choseong: "ㅎ",
      jungseong: "ㅣ",
      jongseong: "ㅎ",
    });
  });

  it("한자·비한글은 null", () => {
    expect(decomposeSyllable("洪")).toBeNull();
    expect(decomposeSyllable("A")).toBeNull();
    expect(decomposeSyllable("ㄱ")).toBeNull(); // 단독 자모는 완성형 아님
  });
});

describe("isHangulSyllable", () => {
  it("완성형 한글만 true", () => {
    expect(isHangulSyllable("홍")).toBe(true);
    expect(isHangulSyllable("洪")).toBe(false);
    expect(isHangulSyllable("ㅏ")).toBe(false);
  });
});

describe("decomposeName — 이름 분해", () => {
  it("홍길동 3음절을 분해한다", () => {
    const r = decomposeName("홍길동");
    expect(r.map((d) => d.choseong)).toEqual(["ㅎ", "ㄱ", "ㄷ"]);
    expect(r.map((d) => d.jongseong)).toEqual(["ㅇ", "ㄹ", "ㅇ"]);
  });

  it("비한글은 건너뛴다", () => {
    expect(decomposeName("김 A 수").map((d) => d.syllable)).toEqual(["김", "수"]);
  });
});
