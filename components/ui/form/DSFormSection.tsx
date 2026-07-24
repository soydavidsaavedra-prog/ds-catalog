import DSCard from "@/components/ui/DSCard";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function DSFormSection({
  title,
  description,
  children,
}: Props) {
  return (
    <DSCard>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </DSCard>
  );
}