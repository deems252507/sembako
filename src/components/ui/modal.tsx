import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-xl sm:rounded-3xl sm:p-6",
          wide ? "max-w-lg" : "max-w-md",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="font-display text-xl tracking-tight text-fg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-bg"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
