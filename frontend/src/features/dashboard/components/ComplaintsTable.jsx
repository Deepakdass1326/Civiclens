import { Link } from "react-router-dom";
import AnimatedImpactBadge from "../../../components/ui/AnimatedImpactBadge";
import Card from "../../../components/ui/Card";

const STATUS_OPTIONS = ["pending", "in_progress", "resolved"];
const VERIFICATION_OPTIONS = ["unverified", "field_verified", "authority_verified"];

export default function ComplaintsTable({ complaints, onStatusChange, onVerificationChange, isAdmin }) {
  if (!complaints || complaints.length === 0) {
    return <Card className="text-center text-slate-400 text-sm">No complaints match the current filters.</Card>;
  }

  return (
    <Card padded={false} className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="px-4 py-3 font-medium">Issue</th>
            <th className="px-4 py-3 font-medium">Ward</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="px-4 py-3 font-medium">Impact</th>
            <th className="px-4 py-3 font-medium">Reports</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Trust</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link to={`/result/${c._id}`} className="font-medium text-slate-700 capitalize hover:text-blue-600">
                  {c.issueType.replace("_", " ")}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{c.ward}</td>
              <td className="px-4 py-3 text-slate-500">{c.department}</td>
              <td className="px-4 py-3"><AnimatedImpactBadge label={c.impactBand} size="sm" /></td>
              <td className="px-4 py-3 text-slate-500">{c.reportCount}</td>
              <td className="px-4 py-3 text-xs text-slate-500 capitalize">{(c.source || "citizen_report").replace("_", " ")}</td>
              <td className="px-4 py-3">
                <select
                  value={c.verificationStatus || "unverified"}
                  disabled={!isAdmin}
                  onChange={(e) => onVerificationChange(c._id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAdmin ? "Set evidence verification level" : "Unlock admin mode to verify evidence"}
                >
                  {VERIFICATION_OPTIONS.map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <select
                  value={c.status}
                  disabled={!isAdmin}
                  onChange={(e) => onStatusChange(c._id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAdmin ? "" : "Unlock admin mode to change status"}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
