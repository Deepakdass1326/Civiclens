import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { Camera, ImageUp } from "lucide-react";

/**
 * Handles photo capture/upload, compresses client-side (so Gemini calls stay
 * fast and mobile data usage stays low), and hands the final base64 payload
 * up to the parent via onPhotoReady.
 */
export default function PhotoUploader({ onPhotoReady }) {
  const [preview, setPreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsCompressing(true);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result; // data:image/jpeg;base64,....
          const base64 = dataUrl.split(",")[1];
          setPreview(dataUrl);
          onPhotoReady({ base64, mimeType: compressed.type || "image/jpeg", previewUrl: dataUrl });
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error("Image compression failed:", err);
        setIsCompressing(false);
      }
    },
    [onPhotoReady]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400"}`}
    >
      <input {...getInputProps()} capture="environment" />
      {preview ? (
        <img src={preview} alt="Issue preview" className="mx-auto max-h-64 rounded-xl object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          {isCompressing ? (
            <p>Processing photo...</p>
          ) : (
            <>
              <div className="flex gap-3">
                <Camera size={28} />
                <ImageUp size={28} />
              </div>
              <p className="font-medium">Take or upload a photo of the issue</p>
              <p className="text-xs">Pothole, garbage, water leakage, streetlight, tree, dumping</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
