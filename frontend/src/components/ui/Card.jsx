export default function Card({ children, className = "", padded = true }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${padded ? "p-6" : ""} ${className}`}>
      {children}
    </div>
  );
}
