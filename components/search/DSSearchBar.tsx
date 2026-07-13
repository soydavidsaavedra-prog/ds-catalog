type DSSearchBarProps = {
  placeholder?: string;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-muted-foreground"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
      />
    </svg>
  );
}

export function DSSearchBar({
  placeholder = "Search products...",
}: DSSearchBarProps) {
  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-md items-center gap-3 rounded-[var(--radius-control)] border border-border bg-surface-elevated px-4 py-3.5 shadow-surface"
    >
      <SearchIcon />
      <span className="text-sm text-muted-foreground">{placeholder}</span>
    </div>
  );
}
