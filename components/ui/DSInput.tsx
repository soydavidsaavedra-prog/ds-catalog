type Props = {
    label?: string;
  } & React.InputHTMLAttributes<HTMLInputElement>;
  
  export default function DSInput({
    label,
    ...props
  }: Props) {
    return (
      <div className="space-y-2">
  
        {label && (
          <label className="text-sm font-medium">
            {label}
          </label>
        )}
  
        <input
          {...props}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
        />
  
      </div>
    );
  }