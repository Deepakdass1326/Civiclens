import { WhatsappShareButton, WhatsappIcon, EmailShareButton, EmailIcon } from "react-share";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import Card from "../../../components/ui/Card";

export default function ShareActions({ complaint }) {
  const [copied, setCopied] = useState(false);
  if (!complaint) return null;

  const shareText = `${complaint.complaintTextEn}\n\nTracking Ref: ${complaint.referenceId}`;
  const trackingUrl = `${window.location.origin}/track/${complaint._id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n\nTrack here: ${trackingUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex items-center justify-center gap-4">
      <button
        onClick={handleCopy}
        className="flex flex-col items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
      >
        {copied ? <Check size={28} className="text-green-600" /> : <Copy size={28} />}
        <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
      </button>

      <WhatsappShareButton url={trackingUrl} title={shareText} className="flex flex-col items-center gap-1">
        <WhatsappIcon size={40} round />
        <span className="text-xs text-slate-600">WhatsApp</span>
      </WhatsappShareButton>

      <EmailShareButton subject="Civic Issue Complaint" body={shareText} url={trackingUrl} className="flex flex-col items-center gap-1">
        <EmailIcon size={40} round />
        <span className="text-xs text-slate-600">Email</span>
      </EmailShareButton>
    </Card>
  );
}
