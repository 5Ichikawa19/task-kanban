import { Suspense } from "react";
import { SquareKanban } from "lucide-react";
import { TaskBoard } from "@/components/TaskBoard";
import { getTasks } from "@/lib/task-queries";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-muted/30 dark:bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SquareKanban className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">タスクカンバン</h1>
            <p className="text-sm text-muted-foreground">タスクを追加して、ステータスごとに管理しましょう</p>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Suspense fallback={<BoardSkeleton />}>
          <TaskBoardLoader />
        </Suspense>
      </main>
    </div>
  );
}

async function TaskBoardLoader() {
  const tasks = await getTasks();
  return <TaskBoard tasks={tasks} />;
}

function BoardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <p className="sr-only">読み込み中…</p>
      <div aria-hidden="true" className="h-56 animate-pulse rounded-xl bg-muted" />
      <div aria-hidden="true" className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
