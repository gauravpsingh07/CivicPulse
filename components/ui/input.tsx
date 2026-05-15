import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] shadow-sm placeholder:text-[var(--muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-strong)] disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
