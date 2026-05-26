import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#1C1917]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-lg bg-[#FAFAF8] text-[#1C1917]",
            "focus:outline-none focus:ring-2 focus:ring-[#6B9E78] focus:border-transparent",
            "disabled:bg-[#F5F4F2] disabled:text-[#A8A29E]",
            error ? "border-[#C4847A]" : "border-[#E8E4DF]",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#9B3D38]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
