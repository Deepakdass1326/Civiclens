import { useState, useRef, useCallback } from "react";

/**
 * Thin wrapper over the browser's native SpeechRecognition API — no external
 * package needed. Supports Hindi ("hi-IN") by default since that's the
 * primary voice-complaint use case here; falls back gracefully if unsupported.
 */
export function useSpeechToText(lang = "hi-IN") {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(
    () => typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
  const recognitionRef = useRef(null);

  const start = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => setTranscript(""), []);

  return { transcript, isListening, isSupported, start, stop, reset };
}
