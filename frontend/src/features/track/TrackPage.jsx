import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

export default function TrackPage() {
  const [inputId, setInputId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputId.trim()) navigate(`/result/${inputId.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-xl font-bold text-slate-800 mb-1">Track Your Complaint</h1>
        <p className="text-sm text-slate-500 mb-4">Enter the complaint ID from your reference link. No login is required.</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Complaint ID"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" icon={Search}>Track</Button>
        </form>
      </Card>
    </div>
  );
}
