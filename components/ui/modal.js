"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  overlayClassName = "",
  panelClassName = "",
  closeOnBackdrop = true
}) {
  const [isBrowser, setIsBrowser] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!isBrowser || !isOpen) return;
    const timer = window.setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      panelRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isBrowser, isOpen]);

  if (!isBrowser || !isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm ${overlayClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
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
