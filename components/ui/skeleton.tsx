import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[linear-gradient(90deg,#eef6e9,#f8fbf4,#eef6e9)] bg-[length:220%_100%]",
        className,
      )}
      {...props}
    />
  );
}
