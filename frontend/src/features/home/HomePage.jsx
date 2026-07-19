import { Link } from "react-router-dom";
import { Camera, LayoutDashboard, Search, ShieldCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">CivicLens AI</h1>
        <p className="text-slate-500 mt-2">
          Not just a complaint collector — a civic decision-support system.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <Camera className="mx-auto text-blue-600" size={28} />
          <p className="font-semibold text-slate-700">Report an issue</p>
          <p className="text-xs text-slate-500">Photo or voice. AI classifies, scores, and routes it instantly.</p>
          <Link to="/report">
            <Button fullWidth>Report Now</Button>
          </Link>
        </Card>

        <Card className="space-y-3">
          <LayoutDashboard className="mx-auto text-blue-600" size={28} />
          <p className="font-semibold text-slate-700">Authority Dashboard</p>
          <p className="text-xs text-slate-500">Live heatmap, impact scores, and department queues.</p>
          <Link to="/dashboard">
            <Button variant="outline" fullWidth>View Dashboard</Button>
          </Link>
        </Card>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} /> Duplicate detection prevents redundant tickets automatically
      </p>

      <Card className="flex items-center justify-between gap-4 text-left">
        <div>
          <p className="font-semibold text-slate-700">Already reported an issue?</p>
          <p className="text-xs text-slate-500 mt-1">Use your reference ID to see the latest status and timeline.</p>
        </div>
        <Link to="/track">
          <Button variant="outline" icon={Search}>Track</Button>
        </Link>
      </Card>
    </div>
  );
}
