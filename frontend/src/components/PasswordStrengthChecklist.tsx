import { Check } from "lucide-react";
import { PASSWORD_CRITERIA } from "@/lib/passwordRules";

export function PasswordStrengthChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-1.5 flex flex-col gap-1 px-2">
      {PASSWORD_CRITERIA.map((criterion) => {
        const met = criterion.test(password);
        return (
          <li
            key={criterion.label}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              met ? "text-green-400" : "text-white/60"
            }`}
          >
            <Check className={`h-3 w-3 shrink-0 ${met ? "opacity-100" : "opacity-30"}`} />
            {criterion.label}
          </li>
        );
      })}
    </ul>
  );
}
