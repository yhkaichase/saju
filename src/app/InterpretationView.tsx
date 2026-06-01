/**
 * 정적 뜻풀이(A) 표시 컴포넌트 — 결정론적 해석을 카드로 보여줍니다(presentational).
 */

import type { SajuInterpretation } from "@/lib/saju/interpretation";
import { ELEMENT_STYLE, STEM_READING, TEN_GOD_READING } from "./saju-labels";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
    </div>
  );
}

export function InterpretationView({ interpretation }: { interpretation: SajuInterpretation }) {
  const { dayMaster, fiveElements, tenGods, majorFortune } = interpretation;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">뜻풀이</h2>

      <Card title={`타고난 기질 — ${dayMaster.title}`}>
        <p>
          일간(나)은 <strong>{dayMaster.stem}</strong> ({STEM_READING[dayMaster.stem]},{" "}
          {dayMaster.yinYang === "陽" ? "양" : "음"})입니다. {dayMaster.text}
        </p>
      </Card>

      <Card title="오행의 균형">
        <p className="mb-3">{fiveElements.summary}</p>
        <div className="flex flex-wrap gap-2">
          {fiveElements.present.map(({ element, count, info }) => {
            const style = ELEMENT_STYLE[element];
            return (
              <span
                key={element}
                className={`rounded-md ${style.bg} ${style.text} px-2 py-1 text-xs font-medium`}
                title={info.text}
              >
                {info.label} ×{count}
              </span>
            );
          })}
        </div>
      </Card>

      <Card title="두드러진 십신">
        <ul className="flex flex-col gap-2">
          {tenGods.highlights.map(({ tenGod, count, info }) => (
            <li key={tenGod}>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {TEN_GOD_READING[tenGod]} ({tenGod})
              </span>
              {count > 1 && <span className="text-zinc-500"> ×{count}</span>}
              <span className="text-zinc-500"> — {info.keyword}</span>
              <p className="text-zinc-600 dark:text-zinc-400">{info.text}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="대운의 흐름">
        <p>{majorFortune.summary}</p>
      </Card>

      <p className="text-xs text-zinc-400">
        위 뜻풀이는 명식에서 도출한 일반 통설이며, 단정이 아니라 경향성 참고용입니다.
      </p>
    </section>
  );
}
