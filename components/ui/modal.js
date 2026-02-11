"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <div
      className={`fixed inset-0 z-[999] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-sm animate-modal-overlay ${overlayClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-2xl animate-modal-panel sm:rounded-2xl sm:p-6 ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:bg-slate-200 touch-manipulation sm:right-4 sm:top-4"
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
    </div>,
    document.body
  );
}
