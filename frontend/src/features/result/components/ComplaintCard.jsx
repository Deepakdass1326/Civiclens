import Badge from "../../../components/ui/Badge";
import AnimatedImpactBadge from "../../../components/ui/AnimatedImpactBadge";
import Card from "../../../components/ui/Card";
import { CheckCircle2, Clock, Loader as LoaderIcon } from "lucide-react";

const STATUS_ICON = { pending: Clock, in_progress: LoaderIcon, resolved: CheckCircle2 };

function StatusTimeline({ history = [] }) {
  if (history.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {history.map((entry, idx) => {
        const Icon = STATUS_ICON[entry.status] || Clock;
        const isLast = idx === history.length - 1;
        return (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <Icon size={14} className={isLast ? "text-blue-600" : "text-slate-400"} />
            <span className={`capitalize ${isLast ? "font-semibold text-slate-700" : "text-slate-400"}`}>
              {entry.status.replace("_", " ")}
            </span>
            <span className="text-slate-300">
              {new Date(entry.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ComplaintCard({ complaint }) {
  if (!complaint) return null;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 capitalize">
            {complaint.issueType.replace("_", " ")}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Ref: {complaint.referenceId}</p>
        </div>
        <div className="flex gap-2">
          <Badge label={complaint.severity} size="sm" />
          <AnimatedImpactBadge label={complaint.impactBand} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-400">Department</p>
          <p className="font-medium text-slate-700">{complaint.department}</p>
        </div>
        <div>
          <p className="text-slate-400">Ward</p>
          <p className="font-medium text-slate-700">{complaint.ward}</p>
        </div>
        <div>
          <p className="text-slate-400">Report Count</p>
          <p className="font-medium text-slate-700">{complaint.reportCount}</p>
        </div>
        <div>
          <p className="text-slate-400">Status</p>
          <p className="font-medium text-slate-700 capitalize">{complaint.status.replace("_", " ")}</p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs text-blue-600 uppercase tracking-wide">Impact score</p><p className="text-xl font-bold text-blue-800">{Math.round((complaint.impactScore || 0) * 100)} / 100</p></div>
          <div className="text-right"><p className="text-xs text-blue-600">Why it matters</p><p className="text-xs text-blue-800">Severity + reports + safety context</p></div>
        </div>
      </div>

      {complaint.impactBreakdown && (
        <details className="rounded-xl border border-slate-200 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Why this priority?</summary>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
            {Object.entries(complaint.impactBreakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-[11px] text-slate-500 capitalize"><span>{key.replace(/([A-Z])/g, " $1")}</span><span>{value}</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${Math.min(Number(value) * 100, 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </details>
      )}

      {complaint.source && <p className="text-xs text-slate-400">Data source: <span className="capitalize">{complaint.source.replace("_", " ")}</span> · {complaint.verificationStatus?.replace("_", " ") || "unverified"}</p>}
      <div className={`rounded-xl border px-3 py-2 text-xs ${complaint.verificationStatus === "authority_verified" ? "border-green-200 bg-green-50 text-green-800" : complaint.verificationStatus === "field_verified" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        <span className="font-semibold">Evidence trust:</span>{" "}
        {complaint.verificationStatus === "authority_verified" ? "Authority verified" : complaint.verificationStatus === "field_verified" ? "Field/community verified" : "Unverified — awaiting corroboration"}
        {complaint.evidenceFlags?.length > 0 && <span> · Flags: {complaint.evidenceFlags.join(", ").replaceAll("_", " ")}</span>}
        {complaint.verificationNote && <span className="block mt-1">Reviewer note: {complaint.verificationNote}</span>}
      </div>
      <div className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
        <span className="font-semibold">Department handoff:</span>{" "}
        {complaint.forwardStatus === "sent" ? `Forwarded to ${complaint.department}${complaint.externalReference ? ` · Ticket ${complaint.externalReference}` : ""}` : complaint.forwardStatus === "failed" ? "Forwarding needs a retry by the authority team." : "Department selected; forwarding adapter is not configured yet."}
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-2">Timeline</p>
        <StatusTimeline history={complaint.statusHistory} />
      </div>

      <div>
        <p className="text-slate-400 text-sm mb-1">Address</p>
        <p className="text-sm text-slate-700">{complaint.address}</p>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">English</p>
          <p className="text-sm text-slate-700 whitespace-pre-line mt-1">{complaint.complaintTextEn}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">हिंदी</p>
          <p className="text-sm text-slate-700 whitespace-pre-line mt-1">{complaint.complaintTextHi}</p>
        </div>
      </div>
    </Card>
  );
}
