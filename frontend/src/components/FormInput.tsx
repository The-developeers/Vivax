import type { InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export function FormInput({ icon: Icon, className, ...props }: FormInputProps) {
  return (
    <div className="relative flex-1">
      {Icon && <Icon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />}
      <input
        {...props}
        className={`w-full rounded-full bg-offwhite py-3 ${Icon ? "pl-11" : "pl-4"} pr-4 text-sm text-charcoal placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-navy ${className ?? ""}`}
      />
    </div>
  );
}
