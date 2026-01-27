export default function Input({ label, id, required, type = "text", helpText, error, className = "", ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        required={required}
        className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        {...props}
      />
      {helpText && !error && (
        <p className="text-[11px] text-slate-500">{helpText}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}
    </div>
  );
}
