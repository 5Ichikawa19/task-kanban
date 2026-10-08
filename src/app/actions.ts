"use server";

import { updateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  isTaskStatus,
  type ActionResult,
  type TaskInput,
  type TaskStatus,
} from "@/lib/tasks";

type TaskRow = { title: string; description: string | null; status: TaskStatus };

// Server Action はクライアントから任意の値で呼べるため、サーバー側で必ず検証する
function validateTaskInput(
  input: TaskInput,
): { ok: true; row: TaskRow } | { ok: false; error: string } {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title.length === 0 || title.length > TITLE_MAX_LENGTH) {
    return { ok: false, error: `タイトルは1〜${TITLE_MAX_LENGTH}文字で入力してください` };
  }

  const description = typeof input.description === "string" ? input.description.trim() : "";
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `説明は${DESCRIPTION_MAX_LENGTH}文字以内で入力してください` };
  }

  if (typeof input.status !== "string" || !isTaskStatus(input.status)) {
    return { ok: false, error: "ステータスが不正です" };
  }

  return {
    ok: true,
    row: { title, description: description.length > 0 ? description : null, status: input.status },
  };
}

export async function createTask(input: TaskInput): Promise<ActionResult> {
  const validated = validateTaskInput(input);
  if (!validated.ok) return validated;

  const { error } = await supabaseServer.from("tasks").insert(validated.row);
  if (error) return { ok: false, error: "タスクの追加に失敗しました" };

  updateTag("tasks");
  return { ok: true };
}

export async function updateTask(id: string, input: TaskInput): Promise<ActionResult> {
  const validated = validateTaskInput(input);
  if (!validated.ok) return validated;

  const { error } = await supabaseServer.from("tasks").update(validated.row).eq("id", id);
  if (error) return { ok: false, error: "タスクの更新に失敗しました" };

  updateTag("tasks");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const { error } = await supabaseServer.from("tasks").delete().eq("id", id);
  if (error) return { ok: false, error: "タスクの削除に失敗しました" };

  updateTag("tasks");
  return { ok: true };
}
