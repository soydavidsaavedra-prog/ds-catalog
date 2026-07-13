import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function DSCard({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}