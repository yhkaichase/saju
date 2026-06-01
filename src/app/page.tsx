import { SajuForm } from "./SajuForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">사주 (四柱)</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          생년월일시를 입력하면 절기·60갑자 기반으로 사주 명식과 오행·십신·대운을 계산하고, 뜻풀이를
          제공합니다. (한국 표준시 기준)
        </p>
      </header>

      <SajuForm />

      <footer className="mt-auto pt-8 text-center text-xs text-zinc-400">
        절기·대운수의 분 단위 값은 천문 계산값이며, KASI 공식 만세력과의 육안 대조는 아직 남아
        있습니다.
      </footer>
    </main>
  );
}
