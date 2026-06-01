/**
 * AI 종합해석(B)용 프롬프트 빌더 — 순수 함수.
 *
 * 정적 뜻풀이(A)의 결정론적 결과를 근거로 LLM에 넘겨, AI가 사실관계를 지어내지
 * 않고 계산된 명식 위에서 자연스러운 종합 해석만 작성하도록 제약합니다.
 * (lib는 app/외부에 의존하지 않으므로 한자 표기를 그대로 사용합니다.)
 */

import type { SajuChart } from "../saju-chart";
import { buildInterpretation, type SajuInterpretation } from "./index";

export interface InterpretationPrompt {
  system: string;
  user: string;
}

const SYSTEM_PROMPT = [
  "당신은 한국 명리학(사주팔자)에 정통한 상담가입니다.",
  "아래에 '이미 계산되고 검증된' 명식과 그 객관적 분석이 주어집니다.",
  "규칙:",
  "1. 주어진 간지·오행·십신·대운 수치를 절대 바꾸거나 새로 지어내지 마세요. 해석만 하세요.",
  "2. 운명을 단정하거나 겁주지 말고, 경향성과 조언으로 따뜻하고 균형 있게 풀어주세요.",
  "3. 길흉을 확정하기보다 강점과 보완점을 함께 제시하세요.",
  "4. 건강·재물·수명 등 민감한 주제는 단정적 예언을 피하고 신중하게 다루세요.",
  "5. 한국어 존댓말로, 일반 독자가 이해할 수 있게 쉽게 설명하세요.",
  "다음 구성으로 작성하세요:",
  "## 타고난 기질 / ## 오행의 균형 / ## 두드러진 십신 / ## 대운의 흐름 / ## 종합 조언",
].join("\n");

function pillarLine(label: string, p: SajuChart["day"]): string {
  const stemGod = p.stem.tenGod ? ` 천간십신=${p.stem.tenGod}` : " (일간)";
  return (
    `- ${label}: ${p.stem.value}${p.branch.value} ` +
    `(천간 ${p.stem.value}=${p.stem.element}${stemGod}, ` +
    `지지 ${p.branch.value}=${p.branch.element} 십신=${p.branch.tenGod})`
  );
}

/** 명식 + 정적 분석을 LLM 프롬프트로 직렬화합니다. */
export function buildInterpretationPrompt(
  chart: SajuChart,
  interpretation: SajuInterpretation = buildInterpretation(chart),
): InterpretationPrompt {
  const { dayMaster, fiveElements, tenGods, majorFortune } = interpretation;

  const pillars = [
    pillarLine("시주", chart.hour),
    pillarLine("일주", chart.day),
    pillarLine("월주", chart.month),
    pillarLine("연주", chart.year),
  ].join("\n");

  const elementCounts = (["木", "火", "土", "金", "水"] as const)
    .map((e) => `${e}=${fiveElements.counts[e]}`)
    .join(", ");

  const tenGodList = tenGods.highlights.map((h) => `${h.tenGod}×${h.count}`).join(", ") || "(없음)";

  const user = [
    "# 계산된 사주 명식",
    pillars,
    "",
    `# 일간(나): ${dayMaster.stem}(${dayMaster.yinYang}) — ${dayMaster.title}`,
    dayMaster.text,
    "",
    "# 오행 분포 (천간4+지지4)",
    elementCounts,
    fiveElements.summary,
    "",
    "# 십신 분포",
    tenGodList,
    "",
    "# 대운",
    majorFortune.summary,
    "",
    "위 명식을 바탕으로 종합 해석을 작성해 주세요.",
  ].join("\n");

  return { system: SYSTEM_PROMPT, user };
}
