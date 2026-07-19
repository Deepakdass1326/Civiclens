export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  );
}
