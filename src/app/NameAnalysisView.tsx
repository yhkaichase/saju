/**
 * 성명학 결과판 — 발음오행·오격/81수리·음양·자원오행·사주조화를 표시(presentational).
 */

import type { NameAnalysis } from "@/lib/saju/naming";
import { ELEMENT_STYLE } from "./saju-labels";

function ElementChip({ element, label }: { element: string; label?: string }) {
  const style = ELEMENT_STYLE[element as keyof typeof ELEMENT_STYLE];
  return (
    <span className={`rounded-md ${style.bg} ${style.text} px-2 py-1 text-xs font-medium`}>
      {label ?? style.label}
    </span>
  );
}

function FortuneBadge({ fortune }: { fortune: string }) {
  const tone =
    fortune === "길"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : fortune === "흉"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${tone}`}>{fortune}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
    </div>
  );
}

const GRID_LABELS: Array<{ key: "cheon" | "in" | "ji" | "oe" | "chong"; label: string }> = [
  { key: "cheon", label: "天格(천격)" },
  { key: "in", label: "人格(인격)" },
  { key: "ji", label: "地格(지격)" },
  { key: "oe", label: "外格(외격)" },
  { key: "chong", label: "總格(총격)" },
];

export function NameAnalysisView({ analysis }: { analysis: NameAnalysis }) {
  const { surnameHangul, givenHangul, sound, strokeAnalysis, harmony, fallbackReason } = analysis;
  const fullName = surnameHangul + givenHangul;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">성명학 — {fullName}</h2>

      <Card title="발음오행 (소리오행)">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {sound.elements.map((el, i) => (
            <ElementChip key={i} element={el} />
          ))}
          <span className="ml-1">
            {sound.isAuspicious ? <FortuneBadge fortune="길" /> : <FortuneBadge fortune="흉" />}
          </span>
        </div>
        <p className="text-zinc-500">
          인접 소리의{" "}
          {sound.isAuspicious
            ? "상생(相生) 흐름이라 무난합니다."
            : "상극(相剋)이 있어 주의로 봅니다."}{" "}
          ({sound.system === "sulga" ? "술가체계" : "해례본"} 기준)
        </p>
      </Card>

      {strokeAnalysis ? (
        <>
          <Card title="오격 · 81수리">
            <ul className="flex flex-col gap-1">
              {GRID_LABELS.map(({ key, label }) => {
                const num = strokeAnalysis.numerology[key];
                return (
                  <li key={key} className="flex items-center gap-2">
                    <span className="w-28 text-zinc-500">{label}</span>
                    <span className="font-medium">{strokeAnalysis.grids[key]}획</span>
                    <FortuneBadge fortune={num.fortune} />
                    <span className="text-zinc-500">{num.name}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="음양 · 자원오행">
            <p className="mb-2">
              음양 배열{" "}
              <span className="font-medium">{strokeAnalysis.yinYang.marks.join(" ")}</span> —{" "}
              {strokeAnalysis.yinYang.isAuspicious ? (
                <FortuneBadge fortune="길" />
              ) : (
                <FortuneBadge fortune="흉" />
              )}{" "}
              <span className="text-zinc-500">
                ({strokeAnalysis.yinYang.isAuspicious ? "음양 섞임" : "순양/순음"})
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500">자원오행</span>
              {strokeAnalysis.resourceElements.map((el, i) =>
                el ? (
                  <ElementChip key={i} element={el} />
                ) : (
                  <span key={i} className="text-xs text-zinc-400">
                    (미상)
                  </span>
                ),
              )}
            </div>
          </Card>
        </>
      ) : (
        <p className="rounded-md bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-800/50">
          {fallbackReason}
        </p>
      )}

      {harmony && (
        <Card title="사주와의 조화">
          <p className="mb-2">
            명식에 보완이 필요한 오행:{" "}
            {harmony.needed.map((el, i) => (
              <span key={i} className="mr-1 inline-block">
                <ElementChip element={el} />
              </span>
            ))}
          </p>
          <p>
            {harmony.complements ? (
              <span className="text-emerald-700 dark:text-emerald-300">
                이름이 부족한 오행을 보완해 줍니다
                {harmony.filledByResource.length > 0 && " (자원오행)"}
                {harmony.filledBySound.length > 0 && " (발음오행)"}.
              </span>
            ) : (
              <span className="text-zinc-500">이름이 부족 오행을 직접 보완하지는 않습니다.</span>
            )}
          </p>
        </Card>
      )}

      <p className="text-xs text-zinc-400">
        성명학은 학파별로 규칙이 갈립니다(발음오행 土·水 배속 등). 본 결과는 통용 기준(술가체계·강희
        원획)을 따른 참고용이며, 한자표는 엄선 시드라 일부 글자는 분석이 생략될 수 있습니다.
      </p>
    </section>
  );
}
