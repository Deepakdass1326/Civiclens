import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, RefreshCw, Sparkles } from "lucide-react";
import PhotoUploader from "./components/PhotoUploader";
import VoiceRecorder from "./components/VoiceRecorder";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { useGeolocation } from "../../hooks/useGeolocation";
import { useComplaintFlow } from "../../hooks/useComplaintFlow";

const DEMO_COORDS = { lat: 28.6139, lng: 77.209 };

export default function ReportPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("photo");
  const [photoPayload, setPhotoPayload] = useState(null);
  const [voiceText, setVoiceText] = useState("");
  const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" });
  const [locationMode, setLocationMode] = useState("gps");

  const { coords, status: geoStatus, error: geoError, requestLocation } = useGeolocation();
  const { classification, lowConfidence, classifyStatus, classifyError, submitStatus, submitError, classify, submit, reset } = useComplaintFlow();

  useEffect(() => {
    reset();
    requestLocation();
  }, [reset, requestLocation]);

  const activeCoords = useMemo(() => {
    if (coords) return coords;
    if (!manualCoords.lat.trim() || !manualCoords.lng.trim()) return null;
    const lat = Number(manualCoords.lat);
    const lng = Number(manualCoords.lng);
    if (Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
    return null;
  }, [coords, manualCoords]);

  const handleManualLocation = (field, value) => {
    setLocationMode("manual");
    setManualCoords((current) => ({ ...current, [field]: value }));
  };

  const useDemoLocation = () => {
    setLocationMode("demo");
    setManualCoords({ lat: String(DEMO_COORDS.lat), lng: String(DEMO_COORDS.lng) });
  };

  const handleClassify = () => {
    if (mode === "photo" && photoPayload) {
      classify({ imageBase64: photoPayload.base64, mimeType: photoPayload.mimeType });
    } else if (mode === "voice" && voiceText.trim()) {
      classify({ description: voiceText.trim() });
    }
  };

  const handleSubmit = async () => {
    if (!classification || !activeCoords) return;
    const action = await submit({
      classification,
      lat: activeCoords.lat,
      lng: activeCoords.lng,
      inputMode: mode,
      imageBase64: photoPayload?.base64 || null,
      imageMimeType: photoPayload?.mimeType || "image/jpeg",
      roadType: "residential",
    });
    if (action.payload?.complaint?._id) navigate(`/result/${action.payload.complaint._id}`);
  };

  const canClassify = (mode === "photo" && photoPayload) || (mode === "voice" && voiceText.trim());

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> Step 1 of 3
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mt-1">Report a Civic Issue</h1>
        <p className="text-slate-500 text-sm mt-1">Share a photo or speak naturally. CivicLens will classify, prioritize and route it.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="rounded-xl bg-blue-50 text-blue-700 px-2 py-2 font-medium">1. Capture</div>
        <div className="rounded-xl bg-slate-100 text-slate-500 px-2 py-2">2. Analyze</div>
        <div className="rounded-xl bg-slate-100 text-slate-500 px-2 py-2">3. Track</div>
      </div>

      <div className="flex gap-2">
        <Button variant={mode === "photo" ? "primary" : "outline"} onClick={() => setMode("photo")}>Photo</Button>
        <Button variant={mode === "voice" ? "primary" : "outline"} onClick={() => setMode("voice")}>Voice</Button>
      </div>

      <Card>
        {mode === "photo" ? <PhotoUploader onPhotoReady={setPhotoPayload} /> : <VoiceRecorder onTranscriptReady={setVoiceText} />}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin size={18} className="text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">Where is the issue?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {geoStatus === "loading" && "Detecting your location..."}
              {geoStatus === "succeeded" && coords && `GPS captured: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
              {geoStatus === "failed" && (geoError || "GPS unavailable. You can enter a location manually.")}
            </p>
          </div>
          {geoStatus === "loading" && <RefreshCw size={16} className="animate-spin text-slate-400" />}
        </div>

        {geoStatus === "failed" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={requestLocation} icon={RefreshCw}>Retry GPS</Button>
            <Button variant="secondary" onClick={useDemoLocation}>Use Delhi demo location</Button>
          </div>
        )}

        {(geoStatus === "failed" || locationMode === "manual") && !coords && (
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Latitude" type="number" step="any" placeholder="Latitude" value={manualCoords.lat} onChange={(e) => handleManualLocation("lat", e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label="Longitude" type="number" step="any" placeholder="Longitude" value={manualCoords.lng} onChange={(e) => handleManualLocation("lng", e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          </div>
        )}

        {activeCoords && geoStatus !== "succeeded" && <p className="text-xs text-green-700">Location ready: {activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)}</p>}
      </Card>

      {!classification && <Button fullWidth disabled={!canClassify || classifyStatus === "loading"} onClick={handleClassify} icon={Sparkles}>{classifyStatus === "loading" ? "Analyzing..." : "Analyze with AI"}</Button>}
      {classifyStatus === "loading" && <Loader label="Analyzing the issue and checking its safety context..." />}

      {classifyStatus === "failed" && <Card className="bg-red-50 border-red-200"><p className="text-sm text-red-700">Couldn't analyze the issue: {classifyError || "unknown error"}. Please try again.</p></Card>}
      {submitStatus === "failed" && <Card className="bg-red-50 border-red-200"><p className="text-sm text-red-700">Couldn't submit the complaint: {submitError || "unknown error"}. Please try again.</p></Card>}

      {classification && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-slate-400 uppercase tracking-wide">Step 2 of 3 · AI assessment</p><h3 className="font-semibold text-slate-800 capitalize mt-1">{classification.issue_type.replace("_", " ")}</h3></div>
            <Badge label={classification.severity} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">AI confidence</p><p className="font-semibold text-slate-700">{Math.round(classification.confidence * 100)}%</p></div>
            <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Estimated area</p><p className="font-semibold text-slate-700 capitalize">{classification.estimated_area}</p></div>
          </div>
          <p className="text-sm text-slate-600">{classification.reasoning}</p>
          {classification.hazard_notes && <p className="text-xs text-orange-600 font-medium">⚠ {classification.hazard_notes}</p>}
          {lowConfidence && <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2"><p className="text-xs text-yellow-700">AI confidence is low. Retake the photo in better light if possible, or submit for manual review.</p></div>}
          <Button fullWidth onClick={handleSubmit} disabled={submitStatus === "loading" || !activeCoords}>{submitStatus === "loading" ? "Submitting..." : !activeCoords ? "Add a location to continue" : "Submit Complaint"}</Button>
          <p className="text-center text-xs text-slate-400">Your report will be tagged as a citizen report and can be tracked after submission.</p>
        </Card>
      )}
    </div>
  );
}
