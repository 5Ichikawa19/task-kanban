import { cacheTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { isTaskStatus, type Task } from "@/lib/tasks";

// タスク一覧を取得する。追加・編集・削除の Server Action が updateTag("tasks") で無効化する
export async function getTasks(): Promise<Task[]> {
  "use cache";
  cacheTag("tasks");

  const { data, error } = await supabaseServer
    .from("tasks")
    .select("id, title, description, status, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`タスクの取得に失敗しました: ${error.message}`);
  }

  return data.flatMap((row) =>
    isTaskStatus(row.status)
      ? [
          {
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            createdAt: row.created_at,
          },
        ]
      : [],
  );
}
