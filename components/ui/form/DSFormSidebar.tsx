import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function DSFormSidebar({
  children,
}: Props) {
  return (
    <div className="sticky top-6 space-y-6">
      {children}
    </div>
  );
}