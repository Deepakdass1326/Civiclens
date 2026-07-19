import { useState } from "react";
import { ShieldCheck, LogOut } from "lucide-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

/**
 * Renders a compact password prompt when not authenticated, or an
 * "Admin mode on" indicator with a logout button when authenticated.
 * Viewing the dashboard stays public — this only gates status changes.
 * Auth state lives in the parent (DashboardPage) so it stays in sync
 * with whatever else reads it — this component is presentational only.
 */
export default function AdminGate({ isAdmin, onLogin, onLogout, authStatus = "idle", authError }) {
  const [input, setInput] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onLogin(input.trim()).then((success) => {
      if (success) setInput("");
    });
  };

  if (isAdmin) {
    return (
      <Card className="flex items-center justify-between py-3">
        <span className="flex items-center gap-2 text-sm text-green-700 font-medium">
          <ShieldCheck size={16} /> Admin mode on — status changes enabled
        </span>
        <Button variant="outline" onClick={onLogout} icon={LogOut}>
          Log out
        </Button>
      </Card>
    );
  }

  return (
    <Card className="py-3">
      <form onSubmit={handleLogin} className="flex items-center gap-2">
        <span className="text-sm text-slate-500 shrink-0">Authority unlock:</span>
        <input
          aria-label="Admin password"
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" variant="secondary" disabled={authStatus === "loading"}>
          {authStatus === "loading" ? "Checking..." : "Unlock"}
        </Button>
      </form>
      {authError && <p className="text-xs text-red-600 mt-2">{authError}</p>}
    </Card>
  );
}
