/**
 * AI 종합해석(B)용 프롬프트 빌더 — 순수 함수.
 *
 * 정적 뜻풀이(A)의 결정론적 결과를 근거로 LLM에 넘겨, AI가 사실관계를 지어내지
 * 않고 계산된 명식 위에서 자연스러운 종합 해석만 작성하도록 제약합니다.
 * (lib는 app/외부에 의존하지 않으므로 한자 표기를 그대로 사용합니다.)
 *
 * 이름이 주어지면 호칭에 쓰고, 성명학 분석(발음오행·오격/81수리·자원오행·사주조화)을
 * 함께 넘겨 "## 이름 풀이" 섹션을 추가하도록 합니다.
 */

import type { NameAnalysis } from "../naming";
import type { SajuChart } from "../saju-chart";
import { buildInterpretation, type SajuInterpretation } from "./index";

export interface InterpretationPrompt {
  system: string;
  user: string;
}

export interface InterpretationPromptOptions {
  interpretation?: SajuInterpretation;
  /** 사람 이름(한글). 있으면 호칭에 사용. */
  name?: string;
  /** 성명학 분석. 있으면 이름 풀이 섹션을 추가. */
  nameAnalysis?: NameAnalysis;
}

function systemPrompt(hasName: boolean, hasNameAnalysis: boolean): string {
  const lines = [
    "당신은 한국 명리학(사주팔자)과 성명학에 정통한 상담가입니다.",
    "아래에 '이미 계산되고 검증된' 명식과 그 객관적 분석이 주어집니다.",
    "규칙:",
    "1. 주어진 간지·오행·십신·대운·획수·수리 수치를 절대 바꾸거나 새로 지어내지 마세요. 해석만 하세요.",
    "2. 운명을 단정하거나 겁주지 말고, 경향성과 조언으로 따뜻하고 균형 있게 풀어주세요.",
    "3. 길흉을 확정하기보다 강점과 보완점을 함께 제시하세요.",
    "4. 건강·재물·수명 등 민감한 주제는 단정적 예언을 피하고 신중하게 다루세요.",
    "5. 한국어 존댓말로, 일반 독자가 이해할 수 있게 쉽게 설명하세요.",
  ];
  if (hasName) {
    lines.push("6. 상담자를 이름(○○○님)으로 자연스럽게 호칭하세요.");
  }
  const sections = ["## 타고난 기질", "## 오행의 균형", "## 두드러진 십신", "## 대운의 흐름"];
  if (hasNameAnalysis) sections.push("## 이름 풀이");
  sections.push("## 종합 조언");
  lines.push("다음 구성으로 작성하세요:", sections.join(" / "));
  if (hasNameAnalysis) {
    lines.push(
      "성명학은 학파에 따라 갈리므로 '참고' 톤으로 다루고, 사주와 이름의 오행 조화에 초점을 두세요.",
    );
  }
  return lines.join("\n");
}

function pillarLine(label: string, p: SajuChart["day"]): string {
  const stemGod = p.stem.tenGod ? ` 천간십신=${p.stem.tenGod}` : " (일간)";
  return (
    `- ${label}: ${p.stem.value}${p.branch.value} ` +
    `(천간 ${p.stem.value}=${p.stem.element}${stemGod}, ` +
    `지지 ${p.branch.value}=${p.branch.element} 십신=${p.branch.tenGod})`
  );
}

/** 성명학 분석을 프롬프트용 텍스트로 직렬화합니다. */
function nameSection(name: string | undefined, na: NameAnalysis): string[] {
  const lines: string[] = ["", `# 이름 성명학${name ? ` (${name}님)` : ""}`];
  lines.push(
    `- 발음오행: ${na.sound.elements.join("→")} (${na.sound.isAuspicious ? "상생 무난" : "상극 있음"}, ${na.sound.system === "sulga" ? "술가체계" : "해례본"})`,
  );
  if (na.strokeAnalysis) {
    const n = na.strokeAnalysis.numerology;
    lines.push(
      `- 오격/81수리: 天${na.strokeAnalysis.grids.cheon}(${n.cheon.fortune}) ` +
        `人${na.strokeAnalysis.grids.in}(${n.in.fortune}) 地${na.strokeAnalysis.grids.ji}(${n.ji.fortune}) ` +
        `外${na.strokeAnalysis.grids.oe}(${n.oe.fortune}) 總${na.strokeAnalysis.grids.chong}(${n.chong.fortune})`,
    );
    lines.push(
      `- 음양배열: ${na.strokeAnalysis.yinYang.marks.join("")} (${na.strokeAnalysis.yinYang.isAuspicious ? "섞임=길" : "치우침=흉"})`,
    );
    const res = na.strokeAnalysis.resourceElements.filter(Boolean).join(",");
    if (res) lines.push(`- 자원오행: ${res}`);
  } else if (na.fallbackReason) {
    lines.push(`- (획수 기반 분석 생략: ${na.fallbackReason})`);
  }
  if (na.harmony) {
    lines.push(
      `- 사주 조화: 명식 보완 필요 오행 ${na.harmony.needed.join("·")} → ` +
        `이름이 ${na.harmony.complements ? "보완함" : "직접 보완하지 않음"}`,
    );
  }
  return lines;
}

/** 명식 + 정적 분석(+선택: 이름 성명학)을 LLM 프롬프트로 직렬화합니다. */
export function buildInterpretationPrompt(
  chart: SajuChart,
  options: InterpretationPromptOptions = {},
): InterpretationPrompt {
  const interpretation = options.interpretation ?? buildInterpretation(chart);
  const { dayMaster, fiveElements, tenGods, majorFortune } = interpretation;
  const { name, nameAnalysis } = options;

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
    ...(name ? [`# 상담자: ${name}님`, ""] : []),
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
    ...(nameAnalysis ? nameSection(name, nameAnalysis) : []),
    "",
    "위 명식을 바탕으로 종합 해석을 작성해 주세요.",
  ].join("\n");

  return { system: systemPrompt(Boolean(name), Boolean(nameAnalysis)), user };
}
