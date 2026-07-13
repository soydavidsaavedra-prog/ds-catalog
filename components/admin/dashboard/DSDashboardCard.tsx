import DSCard from "@/components/ui/DSCard";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function DSDashboardCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <DSCard>
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="mt-2 text-4xl font-bold">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>
      )}
    </DSCard>
  );
}