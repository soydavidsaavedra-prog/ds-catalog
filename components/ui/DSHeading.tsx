type Props = {
    title: string;
    subtitle?: string;
  };
  
  export default function DSHeading({
    title,
    subtitle,
  }: Props) {
    return (
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          {title}
        </h1>
  
        {subtitle && (
          <p className="text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    );
  }