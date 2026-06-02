"use client";

/**
 * AI 종합해석(B) — 버튼을 누르면 /api/saju/interpret 를 호출해 토큰을 스트리밍으로
 * 받아 화면에 채워 넣습니다. 비용 절약을 위해 자동 호출하지 않고 사용자가 요청할 때만
 * 생성합니다.
 */

import { useState } from "react";

import type { NameAnalysis } from "@/lib/saju/naming";
import type { SajuChart } from "@/lib/saju/saju-chart";

type Status = "idle" | "streaming" | "done" | "error";

/** "## 제목" 줄은 소제목으로, 나머지는 문단으로 렌더링하는 최소 마크다운. */
function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h4 key={i} className="mt-3 mb-1 font-semibold text-zinc-900 first:mt-0 dark:text-zinc-100">
          {trimmed.slice(3)}
        </h4>
      );
    }
    return (
      <p key={i} className="mb-2">
        {trimmed.replace(/^[-*]\s+/, "· ")}
      </p>
    );
  });
}

export function AiReading({
  chart,
  name,
  nameAnalysis,
}: {
  chart: SajuChart;
  name?: string;
  nameAnalysis?: NameAnalysis;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("streaming");
    setText("");
    setError(null);

    try {
      const res = await fetch("/api/saju/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chart, name, nameAnalysis }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "AI 해석 생성에 실패했습니다.");
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setStatus("done");
    } catch {
      setError("네트워크 오류로 해석을 받지 못했습니다.");
      setStatus("error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">AI 종합해석</h2>
        <button
          type="button"
          onClick={generate}
          disabled={status === "streaming"}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "streaming" ? "해석 중…" : status === "done" ? "다시 해석" : "AI 해석 보기"}
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {(status === "streaming" || status === "done") && (
        <div className="rounded-xl border border-zinc-200 p-5 text-sm leading-relaxed text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
          {text ? renderText(text) : <span className="text-zinc-400">생성 중…</span>}
          {status === "streaming" && <span className="ml-0.5 animate-pulse">▍</span>}
        </div>
      )}

      <p className="text-xs text-zinc-400">
        AI가 생성한 해석으로 참고용입니다. 같은 명식이라도 호출마다 표현이 달라질 수 있습니다.
      </p>
    </section>
  );
}
