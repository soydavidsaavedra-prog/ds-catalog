import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-strong focus-visible:outline-accent-strong",
  secondary:
    "bg-ink-950 text-ink-0 hover:bg-ink-800 focus-visible:outline-ink-950 dark:bg-ink-0 dark:text-ink-950 dark:hover:bg-ink-100",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:border-foreground focus-visible:outline-foreground",
  ghost: "bg-transparent text-foreground hover:bg-surface focus-visible:outline-foreground",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-sm",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold uppercase tracking-wide transition-colors duration-normal ease-out-ns focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

type NSButtonProps = ButtonAsButton | ButtonAsLink;

export function NSButton(props: NSButtonProps) {
  const { variant = "primary", size = "md", className, children, icon, loading, ...rest } = props;
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      <span>{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    const { href, target, rel, onClick } = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link href={href} target={target} rel={rel} onClick={onClick} className={classes}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button className={classes} disabled={loading || buttonRest.disabled} {...buttonRest}>
      {content}
    </button>
  );
}
