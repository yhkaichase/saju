import { SajuForm } from "./SajuForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">사주 (四柱)</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          생년월일시를 입력하면 만세력 기반으로 사주 명식과 오행·십신·대운을 계산합니다.
        </p>
      </header>

      <SajuForm />

      <footer className="mt-auto pt-8 text-center text-xs text-zinc-400">
        절기·대운수의 분 단위 정답은 KASI 공식 만세력 대조가 진행 중입니다.
      </footer>
    </main>
  );
}
