export default function Button({ children, className = "", as = "button", ...props }) {
  const Component = as;

  const base =
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Component
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
