export default function Badge({ children, variant = "neutral" }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  const variants = {
    neutral: "bg-slate-100 text-slate-700",
    primary: "bg-sky-100 text-sky-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700"
  };

  return (
    <span className={`${base} ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
}
