"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function Dialog({
  open,
  title,
  description,
  children,
  footer,
  onOpenChange,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "w-[min(92vw,34rem)] rounded-lg border border-[var(--line)] bg-white p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-[#17211a]/45",
      )}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
        <Button
          aria-label="Close dialog"
          size="icon"
          variant="ghost"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-3 border-t border-[var(--line)] p-5">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
