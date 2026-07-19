import { NavLink } from "react-router-dom";
import { MapPinned, LayoutDashboard, Camera, Search } from "lucide-react";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
    isActive ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-slate-800">
          <MapPinned className="text-blue-600" size={22} />
          CivicLens AI
        </NavLink>
        <div className="flex gap-2">
          <NavLink to="/report" className={linkClass}>
            <Camera size={16} /> Report
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink to="/track" className={linkClass}>
            <Search size={16} /> Track
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
