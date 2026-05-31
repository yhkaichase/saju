/**
 * 십신(十神) — 일간(日干) 기준 다른 간지와의 관계.
 *
 * ## 규칙
 *   일간의 오행과 대상의 오행 관계(5가지) × 음양 동이(同異, 2가지) = 10신.
 *   - 同오행(比劫): 같으면 比肩, 다르면 劫財
 *   - 일간이 生(食傷): 같으면 食神, 다르면 傷官   ← 食傷만 "같음=안정형"
 *   - 일간이 剋(財):  같으면 偏財, 다르면 正財
 *   - 일간을 剋(官殺): 같으면 偏官(七殺), 다르면 正官
 *   - 일간을 生(印):  같으면 偏印, 다르면 正印
 *   (財·官·印은 "다르면 정正, 같으면 편偏")
 *
 * ## ⚠️ 음양 비교 — 지지는 본기(本氣) 사용
 *   대상이 지지(地支)일 때 음양은 자리 순서(체體)가 아니라 **지장간 본기 천간의
 *   음양(용用)**으로 비교합니다. 子午巳亥에서 결과가 갈립니다.
 *   (EARTHLY_BRANCH_YIN_YANG / EARTHLY_BRANCH_ELEMENT 가 이미 본기 파생)
 *
 * 근거: saju-domain-expert 에이전트 검증(위키백과 십성, 체용론 교차확인).
 *       .claude/rules/saju-domain.md
 */

import {
  EARTHLY_BRANCH_ELEMENT,
  EARTHLY_BRANCH_YIN_YANG,
  FIVE_ELEMENT_GENERATES,
  FIVE_ELEMENT_OVERCOMES,
  HEAVENLY_STEM_ELEMENT,
  HEAVENLY_STEM_YIN_YANG,
} from "./five-elements";
import type { EarthlyBranch, FiveElement, HeavenlyStem, TenGod, YinYang } from "@/types/saju";

/** 오행 관계 → [음양 같음, 음양 다름]에 대응하는 십신. */
type TenGodPair = readonly [same: TenGod, different: TenGod];

/**
 * 일간 대비 대상의 오행 관계를 판정해 십신 쌍을 고릅니다.
 * 관계는 생극으로 결정: 同 / 일간이生(食傷) / 일간이剋(財) / 일간을剋(官殺) / 일간을生(印).
 */
function tenGodPairFor(dayElement: FiveElement, targetElement: FiveElement): TenGodPair {
  if (targetElement === dayElement) {
    return ["比肩", "劫財"]; // 比劫
  }
  if (FIVE_ELEMENT_GENERATES[dayElement] === targetElement) {
    return ["食神", "傷官"]; // 食傷 (일간이 生)
  }
  if (FIVE_ELEMENT_OVERCOMES[dayElement] === targetElement) {
    return ["偏財", "正財"]; // 財 (일간이 剋)
  }
  if (FIVE_ELEMENT_OVERCOMES[targetElement] === dayElement) {
    return ["偏官", "正官"]; // 官殺 (일간을 剋)
  }
  // 다섯 번째이자 마지막 관계: 대상이 일간을 生(印). 오행은 닫혀 있어 이 외의
  // 관계는 존재하지 않지만, 상수 변경 시 조용한 오류를 막기 위해 방어적으로 확인.
  if (FIVE_ELEMENT_GENERATES[targetElement] === dayElement) {
    return ["偏印", "正印"]; // 印
  }
  throw new Error(`오행 관계 판정 실패: day=${dayElement}, target=${targetElement}`);
}

/** 오행·음양으로부터 십신을 구하는 코어. */
export function tenGodOf(
  dayElement: FiveElement,
  dayYinYang: YinYang,
  targetElement: FiveElement,
  targetYinYang: YinYang,
): TenGod {
  const [same, different] = tenGodPairFor(dayElement, targetElement);
  return dayYinYang === targetYinYang ? same : different;
}

/** 일간(천간) 기준, 대상 천간의 십신. */
export function tenGodOfStem(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod {
  return tenGodOf(
    HEAVENLY_STEM_ELEMENT[dayStem],
    HEAVENLY_STEM_YIN_YANG[dayStem],
    HEAVENLY_STEM_ELEMENT[targetStem],
    HEAVENLY_STEM_YIN_YANG[targetStem],
  );
}

/**
 * 일간(천간) 기준, 대상 지지의 십신.
 * 지지의 오행·음양은 본기(本氣)에서 파생된 값을 사용합니다.
 */
export function tenGodOfBranch(dayStem: HeavenlyStem, targetBranch: EarthlyBranch): TenGod {
  return tenGodOf(
    HEAVENLY_STEM_ELEMENT[dayStem],
    HEAVENLY_STEM_YIN_YANG[dayStem],
    EARTHLY_BRANCH_ELEMENT[targetBranch],
    EARTHLY_BRANCH_YIN_YANG[targetBranch],
  );
}
