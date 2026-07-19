import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import MapView from "./components/MapView";
import StatsPanel from "./components/StatsPanel";
import ComplaintsTable from "./components/ComplaintsTable";
import BeforeAfterComparison from "./components/BeforeAfterComparison";
import AdminGate from "./components/AdminGate";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useDashboardData } from "../../hooks/useDashboardData";
import { useAdminAuth } from "../../hooks/useAdminAuth";

const SEVERITY_FILTERS = ["", "low", "medium", "high", "critical"];
const DATA_MODES = [{ value: "real", label: "Live reports only" }, { value: "", label: "Live + demo data" }];

export default function DashboardPage() {
  const { complaints, summary, heatmapPoints, status, error, filters, updateFilters, updateStatus, updateVerification, refresh } = useDashboardData();
  const { isAdmin, token, login, logout, authStatus, authError } = useAdminAuth();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus, token).unwrap();
      toast.success(`Complaint moved to ${newStatus.replace("_", " ")}. Demo notification queued.`);
      refresh();
    } catch (updateError) {
      toast.error(updateError.message || "Status update failed. Please unlock admin mode again.");
    }
  };

  const handleVerificationChange = async (id, verificationStatus) => {
    try {
      await updateVerification(id, verificationStatus, "Updated by authority reviewer", token).unwrap();
      toast.success(`Evidence marked ${verificationStatus.replace("_", " ")}.`);
      refresh();
    } catch (updateError) {
      toast.error(updateError.message || "Verification update failed.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Authority Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Live decision support — not just a complaint inbox.
          </p>
        </div>
        <Button variant="outline" onClick={refresh} icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      <StatsPanel summary={summary} />

      <BeforeAfterComparison />

      <AdminGate isAdmin={isAdmin} onLogin={login} onLogout={logout} authStatus={authStatus} authError={authError} />

      {status === "failed" && <Card className="bg-red-50 border-red-200"><p className="text-sm text-red-700">Dashboard data could not be loaded: {error || "Unknown error"}</p><Button className="mt-3" variant="outline" onClick={refresh}>Try again</Button></Card>}

      <MapView complaints={complaints} heatmapPoints={heatmapPoints} />

      <Card className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-slate-500">Data:</span>
        {DATA_MODES.map((mode) => (
          <button key={mode.label} onClick={() => updateFilters({ source: mode.value })} className={`text-xs px-3 py-1.5 rounded-full border ${filters.source === mode.value ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500"}`}>
            {mode.label}
          </button>
        ))}
        <span className="text-sm font-medium text-slate-500">Filter by severity:</span>
        {SEVERITY_FILTERS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => updateFilters({ severity: s })}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize
              ${filters.severity === s ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-500"}`}
          >
            {s || "All"}
          </button>
        ))}
      </Card>

      {status === "loading" ? (
        <Loader label="Loading complaints..." />
      ) : (
        <ComplaintsTable complaints={complaints} onStatusChange={handleStatusChange} onVerificationChange={handleVerificationChange} isAdmin={isAdmin} />
      )}
    </div>
  );
}
