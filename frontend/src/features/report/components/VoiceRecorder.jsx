import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "../../../hooks/useSpeechToText";

export default function VoiceRecorder({ onTranscriptReady }) {
  const { transcript, isListening, isSupported, start, stop } = useSpeechToText("hi-IN");

  useEffect(() => {
    if (transcript) onTranscriptReady(transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  if (!isSupported) {
    return (
      <p className="text-sm text-slate-500 text-center py-4">
        Voice input isn't supported in this browser. Please use the photo option instead.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        onClick={isListening ? stop : start}
        className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors
          ${isListening ? "bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700"} text-white`}
      >
        {isListening ? <MicOff size={26} /> : <Mic size={26} />}
      </button>
      <p className="text-sm text-slate-500">
        {isListening ? "Listening... speak in Hindi or English" : "Tap to speak (e.g. \"Yaha road toot gayi hai\")"}
      </p>
      {transcript && (
        <div className="mt-2 bg-slate-100 rounded-xl px-4 py-2 text-sm text-slate-700 max-w-sm text-center">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
