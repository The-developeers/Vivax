"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex-1">
      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="w-full rounded-full bg-offwhite py-3 pl-11 pr-11 text-sm text-charcoal placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-navy"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
