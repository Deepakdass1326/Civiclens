import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../../components/ui/Card";

const StatCard = ({ label, value, tone = "text-slate-800" }) => (
  <Card className="text-center">
    <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${tone}`}>{value}</p>
  </Card>
);

export default function StatsPanel({ summary }) {
  if (!summary) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={summary.total} />
        <StatCard label="Pending" value={summary.pending} tone="text-yellow-600" />
        <StatCard label="In Progress" value={summary.inProgress} tone="text-blue-600" />
        <StatCard label="Resolved" value={summary.resolved} tone="text-green-600" />
        <StatCard label="Critical Zones" value={summary.criticalZones} tone="text-red-600" />
        <StatCard label="Verified" value={summary.verified ?? 0} tone="text-indigo-600" />
        <StatCard label="Resolution" value={`${summary.resolutionRate ?? 0}%`} tone="text-green-600" />
      </div>

      <Card>
        <p className="text-sm font-semibold text-slate-600 mb-2">Complaints by Department</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={summary.byDepartment} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="department" width={160} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <p className="text-xs text-slate-400 text-right">Dashboard refreshes automatically every 20 seconds.</p>
    </div>
  );
}
