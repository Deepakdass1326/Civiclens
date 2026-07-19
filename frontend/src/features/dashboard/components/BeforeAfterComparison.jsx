import { X, Check } from "lucide-react";
import Card from "../../../components/ui/Card";

const ROWS = [
  { label: "Department routing", before: "Citizen guesses, often wrong", after: "Auto-routed by AI instantly" },
  { label: "Duplicate reports", before: "20 separate tickets for 1 pothole", after: "Detected & merged automatically" },
  { label: "Prioritization", before: "First-come-first-served queue", after: "Live, explainable Impact Score" },
  { label: "Tracking", before: "No visibility after submission", after: "Timeline + status updates" },
  { label: "Language support", before: "Usually English-only forms", after: "Hindi + English generated automatically" },
];

export default function BeforeAfterComparison() {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-600 mb-3">
        Traditional Complaint Portals vs. CivicLens AI
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-4 font-medium">Capability</th>
              <th className="py-2 pr-4 font-medium">Traditional Portal</th>
              <th className="py-2 font-medium">CivicLens AI</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-700">{row.label}</td>
                <td className="py-2 pr-4 text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <X size={14} className="text-red-400 shrink-0" /> {row.before}
                  </span>
                </td>
                <td className="py-2 text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-green-500 shrink-0" /> {row.after}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
