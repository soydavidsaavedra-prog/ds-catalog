import DSHeading from "@/components/ui/DSHeading";

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function DSAdminHeader({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

      <DSHeading
        title={title}
        subtitle={subtitle}
      />

      {children}

    </div>
  );
}