type Props = {
    title: string;
    description: string;
  };
  
  export default function DSAdminCard({
    title,
    description,
  }: Props) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  
        <h2 className="text-xl font-semibold">
          {title}
        </h2>
  
        <p className="mt-2 text-gray-500">
          {description}
        </p>
  
      </div>
    );
  }