"use client";

import { useMemo, useState } from "react";

import { buildNameAnalysis, type NameInput } from "@/lib/saju/naming";
import type { SajuChart } from "@/lib/saju/saju-chart";
import type { Gender } from "@/types/saju";
import { SajuChartView } from "./SajuChartView";

interface FormState {
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  gender: Gender;
  surnameHangul: string;
  givenHangul: string;
  surnameHanja: string;
  givenHanja: string;
}

const DEFAULT_STATE: FormState = {
  date: "2019-09-07",
  time: "14:50", // 오후 02:50
  gender: "male",
  surnameHangul: "",
  givenHangul: "",
  surnameHanja: "",
  givenHanja: "",
};

/** 제출 시점에 고정한 이름 입력(차트와 함께 스냅샷). */
type SubmittedName = NameInput | null;

export function SajuForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [chart, setChart] = useState<SajuChart | null>(null);
  const [person, setPerson] = useState<SubmittedName>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 이름 분석은 순수 계산이라 클라이언트에서 바로 조립(차트가 있으면 사주 조화 포함).
  const nameAnalysis = useMemo(() => {
    if (!person?.surnameHangul && !person?.givenHangul) return null;
    return buildNameAnalysis(person!, chart ? { chart } : {});
  }, [person, chart]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, minute] = form.time.split(":").map(Number);

    try {
      const res = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, day, hour, minute, gender: form.gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "계산에 실패했습니다.");
        setChart(null);
      } else {
        setChart(data.chart);
        // 이름 입력을 차트와 함께 스냅샷(이후 폼 편집과 분리).
        setPerson(
          form.surnameHangul || form.givenHangul
            ? {
                surnameHangul: form.surnameHangul.trim(),
                givenHangul: form.givenHangul.trim(),
                surnameHanja: form.surnameHanja.trim() || undefined,
                givenHanja: form.givenHanja.trim() || undefined,
              }
            : null,
        );
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setChart(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <form
        onSubmit={onSubmit}
        className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-700"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">생년월일 (양력)</span>
          <input
            type="date"
            required
            value={form.date}
            min="1900-01-01"
            max="2100-12-31"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">출생 시각 (KST)</span>
          <input
            type="time"
            required
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">성별</span>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </label>

        <div className="flex w-full flex-wrap items-end gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <span className="w-full text-xs text-zinc-400">
            이름 (선택) — 입력하면 성명학 분석을 함께 제공합니다. 한자까지 넣으면
            오격·81수리·자원오행까지 봅니다.
          </span>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">성 (한글)</span>
            <input
              type="text"
              value={form.surnameHangul}
              placeholder="예: 황"
              onChange={(e) => setForm({ ...form, surnameHangul: e.target.value })}
              className="w-24 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">이름 (한글)</span>
            <input
              type="text"
              value={form.givenHangul}
              placeholder="예: 연정"
              onChange={(e) => setForm({ ...form, givenHangul: e.target.value })}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">성 (한자)</span>
            <input
              type="text"
              value={form.surnameHanja}
              placeholder="예: 黃"
              onChange={(e) => setForm({ ...form, surnameHanja: e.target.value })}
              className="w-24 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">이름 (한자)</span>
            <input
              type="text"
              value={form.givenHanja}
              placeholder="예: 延政"
              onChange={(e) => setForm({ ...form, givenHanja: e.target.value })}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-5 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "계산 중…" : "사주 보기"}
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {chart && (
        <SajuChartView
          chart={chart}
          nameAnalysis={nameAnalysis}
          personName={person ? person.surnameHangul + person.givenHangul : undefined}
        />
      )}
    </div>
  );
}
