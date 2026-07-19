import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";

const SEVERITY_COLOR = { low: "#22c55e", medium: "#eab308", high: "#f97316", critical: "#dc2626" };

// Injects a leaflet.heat layer imperatively since react-leaflet has no first-class wrapper for it.
function HeatLayer({ points }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    if (points && points.length > 0) {
      layerRef.current = L.heatLayer(points, { radius: 30, blur: 20, maxZoom: 17 }).addTo(map);
    }
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [points, map]);

  return null;
}

function FitToComplaints({ complaints }) {
  const map = useMap();

  useEffect(() => {
    const points = complaints
      .map((complaint) => complaint.location?.coordinates)
      .filter((coordinates) => Array.isArray(coordinates) && coordinates.length === 2)
      .map(([lng, lat]) => [lat, lng]);
    if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 14 });
  }, [complaints, map]);

  return null;
}

export default function MapView({ complaints = [], heatmapPoints = [], center = [28.6139, 77.209] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 h-[420px]">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <HeatLayer points={heatmapPoints} />
        <FitToComplaints complaints={complaints} />
        {complaints.map((c) => (
          <CircleMarker
            key={c._id}
            center={[c.location.coordinates[1], c.location.coordinates[0]]}
            radius={8}
            pathOptions={{ color: SEVERITY_COLOR[c.severity] || "#64748b", fillOpacity: 0.7 }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold capitalize">{c.issueType.replace("_", " ")}</p>
                <p>Severity: {c.severity}</p>
                <p>Dept: {c.department}</p>
                <p>Reports: {c.reportCount}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
