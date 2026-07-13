import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function DSButton({
  children,
  href,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...buttonProps
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition duration-200";

  const variants = {
    primary: "bg-black text-white hover:opacity-90",

    secondary: "bg-gray-100 text-black hover:bg-gray-200",

    outline: "border border-gray-300 bg-white hover:bg-gray-100",
  };

  const classes = [
    base,
    variants[variant],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}