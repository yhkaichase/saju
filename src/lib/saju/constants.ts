/**
 * 사주 기초 상수 — 천간·지지·60갑자.
 *
 * 이 파일의 값들은 천문 계산이 필요 없는 "확정된" 도메인 데이터입니다.
 * 절기(節氣)·음양력 변환 등 근거가 필요한 계산은 별도 모듈에서 골든 테스트와
 * 함께 구현합니다. (참고: .claude/rules/saju-domain.md)
 */

import type { EarthlyBranch, HeavenlyStem, SexagenaryPair } from "@/types/saju";

/**
 * 천간(天干) 10개 — 갑을병정무기경신임계.
 * 순서는 60갑자 순환의 기준이므로 변경 금지.
 */
export const HEAVENLY_STEMS: readonly HeavenlyStem[] = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

/**
 * 지지(地支) 12개 — 자축인묘진사오미신유술해.
 * 순서는 60갑자 순환의 기준이므로 변경 금지.
 */
export const EARTHLY_BRANCHES: readonly EarthlyBranch[] = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

/**
 * 60갑자(六十甲子).
 *
 * 천간(10)과 지지(12)의 최소공배수 = 60.
 * i번째 = (천간[i % 10], 지지[i % 12]). 갑자(甲子)부터 계해(癸亥)까지.
 */
export const SEXAGENARY_CYCLE: readonly SexagenaryPair[] = Array.from(
  { length: 60 },
  (_, i): SexagenaryPair => ({
    heavenlyStem: HEAVENLY_STEMS[i % 10],
    earthlyBranch: EARTHLY_BRANCHES[i % 12],
  }),
);

/**
 * 60갑자에서 (천간, 지지)로 0~59 인덱스를 역산.
 * 유효하지 않은 조합(예: 천간 짝수 인덱스 + 지지 홀수 인덱스)은 -1을 반환합니다.
 */
export function sexagenaryIndexOf(stem: HeavenlyStem, branch: EarthlyBranch): number {
  return SEXAGENARY_CYCLE.findIndex(
    (pair) => pair.heavenlyStem === stem && pair.earthlyBranch === branch,
  );
}

/**
 * 지지(地支)의 본기(本氣) 천간 — 지장간(支藏干) 중 대표 기운.
 *
 * 지지의 오행·음양은 이 본기에서 파생합니다(SSOT). 특히 십신(十神) 계산의
 * 음양 비교는 지지를 단순 인덱스 짝/홀(체體)로 보면 子午巳亥에서 틀리므로,
 * 반드시 본기 천간의 음양(용用)을 써야 합니다.
 *   - 子→癸(陰水), 午→丁(陰火), 巳→丙(陽火), 亥→壬(陽水)가 체와 갈리는 지점.
 *
 * 근거: 명리 체용론(體用論). .claude/rules/saju-domain.md (십신 — 일간 기준 관계).
 */
export const EARTHLY_BRANCH_PRIMARY_STEM: Readonly<Record<EarthlyBranch, HeavenlyStem>> = {
  子: "癸",
  丑: "己",
  寅: "甲",
  卯: "乙",
  辰: "戊",
  巳: "丙",
  午: "丁",
  未: "己",
  申: "庚",
  酉: "辛",
  戌: "戊",
  亥: "壬",
};
