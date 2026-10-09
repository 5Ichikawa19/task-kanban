"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskCardActionsProps = {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
};

// md 以上ではカードのホバー・フォーカス時だけ表示する（親に group/task が必要）
export function TaskCardActions({ title, onEdit, onDelete }: TaskCardActionsProps) {
  return (
    <div className="-mt-1 -mr-1.5 flex shrink-0 gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/task:opacity-100 md:group-focus-within/task:opacity-100">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`「${title}」を編集`}
        onClick={onEdit}
      >
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`「${title}」を削除`}
        onClick={onDelete}
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
      >
        <Trash2 />
      </Button>
    </div>
  );
}
