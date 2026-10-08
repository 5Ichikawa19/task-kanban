import { Suspense } from "react";
import { TaskBoard } from "@/components/TaskBoard";
import { getTasks } from "@/lib/task-queries";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">タスクカンバン</h1>
      <Suspense fallback={<p>読み込み中…</p>}>
        <TaskBoardLoader />
      </Suspense>
    </main>
  );
}

async function TaskBoardLoader() {
  const tasks = await getTasks();
  return <TaskBoard tasks={tasks} />;
}
