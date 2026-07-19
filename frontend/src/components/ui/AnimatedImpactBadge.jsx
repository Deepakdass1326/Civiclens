import { useEffect, useRef, useState } from "react";
import Badge from "./Badge";

/**
 * Wraps Badge with a brief scale+glow transition whenever `label` changes —
 * this is the visual proof of the "live decision support" demo moment when
 * impact score/band updates after a duplicate confirmation.
 */
export default function AnimatedImpactBadge({ label, size = "md" }) {
  const prevLabel = useRef(label);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (prevLabel.current !== label) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 700);
      prevLabel.current = label;
      return () => clearTimeout(timer);
    }
  }, [label]);

  return (
    <span
      className={`inline-block transition-transform duration-500 ${
        isPulsing ? "scale-125" : "scale-100"
      }`}
    >
      <Badge label={label} size={size} />
    </span>
  );
}
