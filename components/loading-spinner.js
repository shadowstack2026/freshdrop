"use client";

/**
 * Återanvändbar loading-spinner med mjuk, tillfredsställande animation.
 * Stödjer storlekar: sm (inline/knappar), md (standard), lg (fullskärmsladdning).
 */
export default function LoadingSpinner({ size = "md", label, className = "" }) {
  const sizeClasses = {
    sm: "loading-spinner-sm",
    md: "loading-spinner-md",
    lg: "loading-spinner-lg"
  };
  const ringSize = sizeClasses[size];

  return (
    <div className={`loading-spinner-wrap flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`loading-spinner-ring ${ringSize}`} aria-hidden>
        <div className="loading-spinner-ring-inner" />
        <div className="loading-spinner-ring-outer" />
      </div>
      {label && (
        <p className="loading-spinner-label text-current font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
