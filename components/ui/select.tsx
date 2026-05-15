import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--foreground)] shadow-sm disabled:cursor-not-allowed disabled:bg-[var(--surface-strong)] disabled:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
