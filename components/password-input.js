"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./ui/input";

export default function PasswordInput({ label, id, required, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        label={label}
        id={id}
        required={required}
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
        aria-label={showPassword ? "Dölj lösenord" : "Visa lösenord"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
