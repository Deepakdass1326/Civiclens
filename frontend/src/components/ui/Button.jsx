const VARIANTS = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  outline: "border border-slate-300 hover:bg-slate-50 text-slate-700",
};

export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
