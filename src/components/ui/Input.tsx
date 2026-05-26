import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const errorId = error && id ? `${id}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#1C1917]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-lg bg-[#FAFAF8] text-[#1C1917] placeholder-[#A8A29E]",
            "focus:outline-none focus:ring-2 focus:ring-[#6B9E78] focus:border-transparent",
            "disabled:bg-[#F5F4F2] disabled:text-[#A8A29E]",
            error ? "border-[#C4847A]" : "border-[#E8E4DF]",
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs text-[#9B3D38]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
