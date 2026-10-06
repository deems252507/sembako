import { Menu } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:h-16 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-mobile-menu"))}
          className="rounded-lg p-2 text-fg hover:bg-bg lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-fg lg:text-lg">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>
          ) : (
            <p className="hidden truncate text-xs text-muted sm:block">{today}</p>
          )}
        </div>
      </div>
      <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-success">
          Online
        </span>
      </div>
    </header>
  );
}
