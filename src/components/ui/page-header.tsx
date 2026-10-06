import { Menu } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("open-mobile-menu"))}
          className="rounded-md p-2 hover:bg-surface lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-fg">{title}</h1>
          {subtitle ? <p className="hidden text-xs text-muted sm:block">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  );
}
