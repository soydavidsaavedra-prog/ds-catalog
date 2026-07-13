type Props = {
    children: React.ReactNode;
  };
  
  export default function DSLabel({
    children,
  }: Props) {
    return (
      <label className="text-sm font-medium text-gray-700">
        {children}
      </label>
    );
  }