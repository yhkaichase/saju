/**
 * 오격(五格) — 수리성명학(熊崎式)의 다섯 격. 한자 원획수(강희 원획법)로 계산합니다.
 *
 * ## 계산식 (성1자 + 이름2자 표준)
 *   天格 = 성 획수 합
 *   人格 = 성 끝자 + 이름 첫자        (主運)
 *   地格 = 이름 획수 합               (이름 한 자면 가성수 1 더함)
 *   外格 = 성 첫자 + 이름 끝자        (이름 한 자면 성 합 + 가성수 1)
 *   總格 = 성·이름 전체 획수 합
 *
 *   ⚠️ 가성수(假成數, 虛數 1): 글자 수가 모자라 격을 만들 수 없을 때 가상의 1획을
 *   채웁니다. 외자 이름의 地格·外格이 대표 사례입니다.
 *   ⚠️ 外格을 "總格 − 人格"으로 보는 일본식 변형도 있으나, 한국 실무 표준은
 *   "성 첫자 + 이름 끝자"입니다(외자 이름에서 결과가 갈림). 본 구현은 후자.
 *   ⚠️ 복성(두 자 성)·3자 이름은 학파차가 커 별도 케이스로 다룹니다(아래 주석).
 *
 * 골든: 李正武(7·5·8) → 天7·人12·地13·外15·總20 (영남일보 생활성명학 검증).
 * 근거: general-purpose 리서치(영남일보·홍정·NameSpring 등 교차검증).
 */

/** 다섯 격의 획수. */
export interface FiveGrids {
  /** 天格(천격). */
  cheon: number;
  /** 人格(인격, 主運). */
  in: number;
  /** 地格(지격, 元運). */
  ji: number;
  /** 外格(외격). */
  oe: number;
  /** 總格(총격). */
  chong: number;
}

const HEOSU = 1; // 가성수(假成數)

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * 성(姓)·이름(名)의 한자 원획수 배열로 오격을 계산합니다.
 *
 * @param surnameStrokes 성 각 글자의 원획수 (단성 1개, 복성 2개).
 * @param givenStrokes 이름 각 글자의 원획수 (1~3개).
 */
export function calculateFiveGrids(surnameStrokes: number[], givenStrokes: number[]): FiveGrids {
  if (surnameStrokes.length === 0 || givenStrokes.length === 0) {
    throw new Error("성과 이름 획수가 각각 1글자 이상 필요합니다.");
  }

  const sFirst = surnameStrokes[0];
  const sLast = surnameStrokes[surnameStrokes.length - 1];
  const nFirst = givenStrokes[0];
  const nLast = givenStrokes[givenStrokes.length - 1];
  const singleName = givenStrokes.length === 1;

  const cheon = sum(surnameStrokes);
  const in_ = sLast + nFirst;
  const ji = singleName ? nFirst + HEOSU : sum(givenStrokes);
  const oe = singleName ? sum(surnameStrokes) + HEOSU : sFirst + nLast;
  const chong = sum(surnameStrokes) + sum(givenStrokes);

  return { cheon, in: in_, ji, oe, chong };
}
