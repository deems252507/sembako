"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    let animId = 0;

    const start = async () => {
      try {
        if (!("BarcodeDetector" in window)) {
          setSupported(false);
          setError("Kamera scan tidak didukung di browser ini. Gunakan Chrome di HP Android, atau ketik barcode manual.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        // @ts-expect-error BarcodeDetector experimental
        const detector = new BarcodeDetector({
          formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a", "upc_e"],
        });

        const tick = async () => {
          if (!activeRef.current) return;
          try {
            if (video.readyState >= 2) {
              const codes = await detector.detect(video);
              if (codes.length > 0 && codes[0].rawValue) {
                activeRef.current = false;
                onScan(codes[0].rawValue);
                onClose();
                return;
              }
            }
          } catch {
            // ignore frame errors
          }
          animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
      } catch (e: any) {
        setError(e?.message || "Tidak bisa akses kamera. Izinkan kamera di browser.");
      }
    };

    start();

    return () => {
      activeRef.current = false;
      cancelAnimationFrame(animId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-green-600" />
            Scan Barcode
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative bg-black aspect-[3/4] max-h-[60vh]">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-green-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
        )}
        {!error && supported && (
          <p className="p-3 text-center text-xs text-slate-500">
            Arahkan kamera ke barcode produk
          </p>
        )}
      </div>
    </div>
  );
}
