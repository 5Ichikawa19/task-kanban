import { cn } from "@/lib/utils";

type ErrorMessageProps = {
  message: string | null;
  className?: string;
};

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p role="alert" className={cn("text-sm text-destructive", className)}>
      {message}
    </p>
  );
}
