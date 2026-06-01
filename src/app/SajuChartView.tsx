/**
 * 명식판(命式) 표시 컴포넌트 — 4기둥 + 대운을 렌더링합니다(presentational).
 */

import { HEAVENLY_STEM_ELEMENT } from "@/lib/saju/five-elements";
import { buildInterpretation } from "@/lib/saju/interpretation";
import type { BranchCell, PillarView, SajuChart, StemCell } from "@/lib/saju/saju-chart";
import { AiReading } from "./AiReading";
import { InterpretationView } from "./InterpretationView";
import { BRANCH_READING, ELEMENT_STYLE, STEM_READING, TEN_GOD_READING } from "./saju-labels";

const PILLAR_TITLES: Array<{
  key: keyof Pick<SajuChart, "hour" | "day" | "month" | "year">;
  label: string;
}> = [
  { key: "hour", label: "시주" },
  { key: "day", label: "일주" },
  { key: "month", label: "월주" },
  { key: "year", label: "연주" },
];

function StemBox({ cell, isDayMaster }: { cell: StemCell; isDayMaster: boolean }) {
  const style = ELEMENT_STYLE[cell.element];
  return (
    <div className={`rounded-lg ${style.bg} px-2 py-3 text-center`}>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        {isDayMaster ? "일간(나)" : cell.tenGod ? TEN_GOD_READING[cell.tenGod] : ""}
      </div>
      <div className={`text-3xl font-semibold ${style.text}`}>{cell.value}</div>
      <div className="text-xs text-zinc-600 dark:text-zinc-300">
        {STEM_READING[cell.value]} · {style.label}
      </div>
    </div>
  );
}

function BranchBox({ cell }: { cell: BranchCell }) {
  const style = ELEMENT_STYLE[cell.element];
  return (
    <div className={`rounded-lg ${style.bg} px-2 py-3 text-center`}>
      <div className={`text-3xl font-semibold ${style.text}`}>{cell.value}</div>
      <div className="text-xs text-zinc-600 dark:text-zinc-300">
        {BRANCH_READING[cell.value]} · {style.label}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{TEN_GOD_READING[cell.tenGod]}</div>
    </div>
  );
}

function PillarColumn({
  title,
  pillar,
  isDay,
}: {
  title: string;
  pillar: PillarView;
  isDay: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </div>
      <StemBox cell={pillar.stem} isDayMaster={isDay} />
      <BranchBox cell={pillar.branch} />
    </div>
  );
}

function hhmm(t: { hour: number; minute: number }): string {
  return `${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;
}

export function SajuChartView({ chart }: { chart: SajuChart }) {
  const { direction, fortuneStartAge, periods } = chart.majorFortune;
  const interpretation = buildInterpretation(chart);
  const { standard, corrected, offsetMinutes } = chart.solarTime;

  return (
    <div className="flex w-full flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">사주 명식 (四柱)</h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {PILLAR_TITLES.map(({ key, label }) => (
            <PillarColumn key={key} title={label} pillar={chart[key]} isDay={key === "day"} />
          ))}
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          진태양시 보정: 표준시 {hhmm(standard)} → {hhmm(corrected)} (서울 기준 {offsetMinutes}분).
          시주·일주는 보정된 시각으로 계산했습니다.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">대운 (大運)</h2>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          {direction === "forward" ? "순행(順行)" : "역행(逆行)"} · {fortuneStartAge}세 시작
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {periods.map((p) => {
            const stemStyle = ELEMENT_STYLE[HEAVENLY_STEM_ELEMENT[p.pillar.heavenlyStem]];
            return (
              <div
                key={p.startAge}
                className="min-w-16 rounded-lg border border-zinc-200 px-3 py-2 text-center dark:border-zinc-700"
              >
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.startAge}세</div>
                <div className={`text-xl font-semibold ${stemStyle.text}`}>
                  {p.pillar.heavenlyStem}
                  {p.pillar.earthlyBranch}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <InterpretationView interpretation={interpretation} />

      <AiReading chart={chart} />
    </div>
  );
}
