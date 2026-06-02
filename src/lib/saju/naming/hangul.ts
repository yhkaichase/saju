/**
 * 한글 자모 분해 — 성명학(발음오행·음양)의 기초.
 *
 * 현대 한글 음절(가~힣, U+AC00~U+D7A3)은 초성·중성·종성의 조합으로 인코딩됩니다.
 *   음절코드 S = code − 0xAC00
 *   초성 = ⌊S / 588⌋,  중성 = ⌊(S % 588) / 28⌋,  종성 = S % 28
 * 이 변환은 유니코드 표준이라 학파 논쟁이 없습니다(순수·결정론적).
 *
 * 발음오행 분류(자음→오행)는 학파가 갈리므로 이 파일이 아니라 별도 모듈에서
 * 출처와 함께 정의합니다. 여기서는 분해만 책임집니다.
 */

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const MEDIAL_COUNT = 21;
const FINAL_COUNT = 28;

/** 초성 19자 (인덱스 0~18). */
export const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

/** 중성 21자 (인덱스 0~20). */
export const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
] as const;

/** 종성 28자 (인덱스 0~27, 0은 받침 없음 ""). */
export const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

export interface DecomposedSyllable {
  /** 원본 음절. */
  syllable: string;
  /** 초성(첫소리) 자음. */
  choseong: (typeof CHOSEONG)[number];
  /** 중성(가운뎃소리) 모음. */
  jungseong: (typeof JUNGSEONG)[number];
  /** 종성(받침). 없으면 "". */
  jongseong: (typeof JONGSEONG)[number];
}

/** 완성형 한글 음절(가~힣) 한 글자인지. */
export function isHangulSyllable(ch: string): boolean {
  if (ch.length !== 1) return false;
  const code = ch.codePointAt(0)!;
  return code >= HANGUL_BASE && code <= HANGUL_LAST;
}

/**
 * 완성형 한글 음절 한 글자를 초·중·종성으로 분해합니다.
 * 완성형 한글이 아니면 null을 반환합니다(한자·공백 등).
 */
export function decomposeSyllable(ch: string): DecomposedSyllable | null {
  if (!isHangulSyllable(ch)) return null;
  const s = ch.codePointAt(0)! - HANGUL_BASE;
  const choseongIndex = Math.floor(s / (MEDIAL_COUNT * FINAL_COUNT));
  const jungseongIndex = Math.floor((s % (MEDIAL_COUNT * FINAL_COUNT)) / FINAL_COUNT);
  const jongseongIndex = s % FINAL_COUNT;
  return {
    syllable: ch,
    choseong: CHOSEONG[choseongIndex],
    jungseong: JUNGSEONG[jungseongIndex],
    jongseong: JONGSEONG[jongseongIndex],
  };
}

/** 한글 문자열(예: 이름)을 음절별로 분해합니다. 비(非)한글 글자는 건너뜁니다. */
export function decomposeName(name: string): DecomposedSyllable[] {
  return [...name].map(decomposeSyllable).filter((d): d is DecomposedSyllable => d !== null);
}
