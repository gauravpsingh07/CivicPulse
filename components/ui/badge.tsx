import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

const variants: Record<BadgeVariant, string> = {
  default: "border-[var(--line)] bg-white text-[var(--foreground)]",
  success: "border-[#b8ddc4] bg-[#e5f7ea] text-[#12633f]",
  warning: "border-[#ead4a3] bg-[#fff4d8] text-[#8a5b0d]",
  danger: "border-[#efc2b7] bg-[#fff0ec] text-[#9d3f29]",
  neutral:
    "border-[var(--line)] bg-[var(--surface-strong)] text-[var(--muted)]",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
