"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Camera } from "lucide-react";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(true);
  const lastCode = useRef("");

  const stop = useCallback(() => {
    activeRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    activeRef.current = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!activeRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        if ("BarcodeDetector" in window) {
          // @ts-expect-error experimental
          const detector = new BarcodeDetector({
            formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code", "upc_a", "upc_e", "codabar", "itf"],
          });
          timer = setInterval(async () => {
            if (!activeRef.current || !videoRef.current) return;
            try {
              if (videoRef.current.readyState < 2) return;
              const codes = await detector.detect(videoRef.current);
              if (codes?.length > 0 && codes[0].rawValue) {
                const code = String(codes[0].rawValue).trim();
                if (code && code !== lastCode.current) {
                  lastCode.current = code;
                  stop();
                  onScan(code);
                  onClose();
                }
              }
            } catch {
              // ignore
            }
          }, 300);
        } else {
          setError("Browser tidak support scan kamera otomatis. Ketik barcode manual di bawah, atau pakai Chrome Android / scanner USB.");
        }
      } catch (e: any) {
        const name = e?.name || "";
        if (name === "NotAllowedError") {
          setError("Akses kamera ditolak. Izinkan kamera di pengaturan browser, lalu coba lagi.");
        } else if (name === "NotFoundError") {
          setError("Kamera tidak ditemukan di perangkat ini.");
        } else {
          setError(e?.message || "Tidak bisa membuka kamera.");
        }
      }
    };

    start();
    return () => {
      stop();
      if (timer) clearInterval(timer);
    };
  }, [onScan, onClose, stop]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-green-600" />
            Scan Barcode
          </h3>
          <button onClick={() => { stop(); onClose(); }} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative bg-black aspect-[3/4] max-h-[50vh]">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-36 border-2 border-green-400 rounded-xl" />
          </div>
        </div>
        {error && <div className="p-3 text-sm text-amber-800 bg-amber-50 border-t">{error}</div>}
        <div className="p-4 space-y-2 border-t">
          <p className="text-xs text-slate-500">Atau ketik / tempel barcode lalu Enter:</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const code = manual.trim();
              if (!code) return;
              stop();
              onScan(code);
              onClose();
            }}
            className="flex gap-2"
          >
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Nomor barcode..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono"
            />
            <button type="submit" className="rounded-xl bg-green-600 px-4 text-sm font-semibold text-white">
              OK
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
