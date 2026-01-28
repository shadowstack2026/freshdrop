"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  if (!isBrowser || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          aria-label="Stäng"
        >
          <X className="h-5 w-5" />
        </button>
        {title && (
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
