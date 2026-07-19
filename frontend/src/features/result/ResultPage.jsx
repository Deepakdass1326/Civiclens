import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import ComplaintCard from "./components/ComplaintCard";
import ShareActions from "./components/ShareActions";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useComplaintFlow } from "../../hooks/useComplaintFlow";
import { fetchComplaintById } from "../../api/complaint.api";

export default function ResultPage() {
  const { id } = useParams();
  const { result, isDuplicate, duplicateMessage, support } = useComplaintFlow();
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmedSupport, setConfirmedSupport] = useState(false);

  const complaint = result && result._id === id ? result : fetched;

  useEffect(() => {
    // If the user landed here directly (e.g. shared link / track flow) and redux
    // doesn't already hold this complaint, fetch it fresh from the API.
    if (!result || result._id !== id) {
      setLoading(true);
      fetchComplaintById(id)
        .then((res) => setFetched(res.complaint))
        .catch(() => setFetched(null))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleConfirmSupport = async () => {
    await support(id, {});
    setConfirmedSupport(true);
  };

  if (loading) return <Loader label="Fetching complaint..." />;

  if (!complaint) {
    return (
      <Card className="text-center text-slate-500">
        Complaint not found. <Link to="/report" className="text-blue-600 font-medium">Report a new issue</Link>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {isDuplicate && !confirmedSupport && (
        <Card className="bg-orange-50 border-orange-200 flex items-start gap-3">
          <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-orange-800 font-medium">
              {duplicateMessage || "This issue is already reported nearby."}
            </p>
            <Button className="mt-3" onClick={handleConfirmSupport}>
              I have this issue too — Support this complaint
            </Button>
          </div>
        </Card>
      )}

      {confirmedSupport && (
        <Card className="bg-green-50 border-green-200 flex items-center gap-2">
          <CheckCircle2 className="text-green-600" size={20} />
          <p className="text-sm text-green-800 font-medium">
            Thanks — your support has been added. Report count updated.
          </p>
        </Card>
      )}

      <ComplaintCard complaint={complaint} />
      <ShareActions complaint={complaint} />

      <div className="text-center">
        <Link to="/dashboard" className="text-sm text-blue-600 font-medium">
          View this issue on the public dashboard →
        </Link>
      </div>
    </div>
  );
}
