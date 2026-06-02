"use client";

/**
 * 한자 후보 선택기 — 모바일에서 한자 키보드 없이 탭으로 한자를 고르도록.
 *
 * 입력된 한글 이름을 음절별로 나눠, 시드 한자표의 후보 한자를 버튼으로 보여줍니다.
 * 모든 음절에서 후보를 고르면 onComplete(전체 한자 문자열)을 호출합니다.
 * 후보가 없는 음절은 직접 입력(폴백)으로 안내합니다.
 */

import { useState } from "react";

import { hanjaCandidates } from "@/lib/saju/naming/hanja-data";

/**
 * 한글이 바뀌면 선택을 초기화해야 하므로, 사용처에서 `key={hangul}`로 리마운트시킵니다.
 * (effect 내 setState 없이 초기 state로 처리)
 */
export function HanjaPicker({
  hangul,
  onComplete,
}: {
  hangul: string;
  onComplete: (hanja: string) => void;
}) {
  const syllables = [...hangul];
  const [selected, setSelected] = useState<(string | null)[]>(() => syllables.map(() => null));

  if (!hangul) return null;

  function pick(index: number, char: string) {
    const next = syllables.map((_, i) => selected[i] ?? null);
    next[index] = next[index] === char ? null : char;
    setSelected(next);
    onComplete(next.every((c): c is string => Boolean(c)) ? next.join("") : "");
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {syllables.map((syl, i) => {
        const cands = hanjaCandidates(syl);
        return (
          <div key={i} className="flex flex-wrap items-center gap-1.5">
            <span className="w-6 text-sm text-zinc-500">{syl}</span>
            {cands.length === 0 ? (
              <span className="text-xs text-zinc-400">후보 없음 — 한자칸에 직접 입력</span>
            ) : (
              cands.map((c) => {
                const active = selected[i] === c.char;
                return (
                  <button
                    key={c.char}
                    type="button"
                    onClick={() => pick(i, c.char)}
                    className={`rounded-md border px-2 py-1 text-sm transition ${
                      active
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {c.char}
                    <span className="ml-1 text-xs opacity-60">{c.strokes}획</span>
                  </button>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
