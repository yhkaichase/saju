"use client";

import { useState } from "react";

import type { SajuChart } from "@/lib/saju/saju-chart";
import type { Gender } from "@/types/saju";
import { SajuChartView } from "./SajuChartView";

interface FormState {
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  gender: Gender;
}

const DEFAULT_STATE: FormState = {
  date: "2019-01-01",
  time: "14:50", // 오후 02:50
  gender: "male",
};

export function SajuForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [chart, setChart] = useState<SajuChart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      {chart && <SajuChartView chart={chart} />}
    </div>
  );
}
