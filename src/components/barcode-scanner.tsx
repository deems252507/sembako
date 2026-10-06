import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Flashlight, FlashlightOff, Keyboard, X } from "lucide-react";
import { playScanBeep } from "@/lib/pos/scan-beep";
import { cn } from "@/lib/utils";

type ScanStatus = "booting" | "live" | "locked" | "error";

export function BarcodeScanner({
  onScan,
  onClose,
}: {
  onScan: (code: string) => { ok: boolean; label?: string };
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onScanRef = useRef(onScan);
  const lastCode = useRef("");
  const lastAt = useRef(0);
  const [status, setStatus] = useState<ScanStatus>("booting");
  const [error, setError] = useState("");
  const [manual, setManual] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [flash, setFlash] = useState(false);
  const [lockLabel, setLockLabel] = useState("");

  onScanRef.current = onScan;

  const stop = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      /* ignore */
    }
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject;
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  }, []);

  const handleCode = useCallback((code: string) => {
    const cleaned = code.trim();
    if (!cleaned) return;
    const now = Date.now();
    if (cleaned === lastCode.current && now - lastAt.current < 1400) {
      playScanBeep("dup");
      return;
    }
    lastCode.current = cleaned;
    lastAt.current = now;
    const result = onScanRef.current(cleaned);
    if (result.ok) {
      playScanBeep("ok");
      setLockLabel(result.label || cleaned);
      setStatus("locked");
      setFlash(true);
      window.setTimeout(() => setFlash(false), 280);
      window.setTimeout(() => setStatus("live"), 700);
    } else {
      playScanBeep("miss");
      setLockLabel(result.label || "Kode belum terdaftar");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 160,
      delayBetweenScanSuccess: 900,
    });

    const start = async () => {
      try {
        const video = videoRef.current;
        if (!video) return;
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          video,
          (result) => {
            if (cancelled || !result) return;
            handleCode(result.getText());
          },
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        const stream = video.srcObject;
        if (stream instanceof MediaStream) {
          const track = stream.getVideoTracks()[0];
          const caps = track?.getCapabilities?.() as { torch?: boolean } | undefined;
          setHasTorch(Boolean(caps?.torch));
        }
        setStatus("live");
      } catch (err) {
        const name = (err as { name?: string })?.name || "";
        if (name === "NotAllowedError") {
          setError("Akses kamera ditolak. Izinkan kamera, lalu buka lagi.");
        } else if (name === "NotFoundError") {
          setError("Kamera tidak ditemukan. Gunakan scanner USB atau ketik barcode.");
        } else {
          setError("Kamera tidak bisa dibuka. Ketik barcode secara manual.");
        }
        setStatus("error");
      }
    };

    void start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [handleCode, stop]);

  const toggleTorch = async () => {
    const stream = videoRef.current?.srcObject;
    if (!(stream instanceof MediaStream)) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn((v) => !v);
    } catch {
      setHasTorch(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/80 sm:items-center sm:p-4">
      <div className="relative flex h-[96dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-ink text-ink-fg shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-3xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Pemindai kasir</p>
            <h3 className="font-display text-xl">Scan produk</h3>
          </div>
          <div className="flex items-center gap-1">
            {hasTorch ? (
              <button
                type="button"
                onClick={() => void toggleTorch()}
                className="rounded-md p-2 text-ink-fg hover:bg-ink-fg/10"
                aria-label="Senter"
              >
                {torchOn ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                stop();
                onClose();
              }}
              className="rounded-md p-2 text-ink-fg hover:bg-ink-fg/10"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative mx-4 overflow-hidden rounded-2xl bg-ink aspect-[3/4] sm:aspect-video">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            autoPlay
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-colors duration-200",
              flash ? "bg-accent/25" : "bg-transparent",
            )}
          />
          <div className="pointer-events-none absolute inset-[16%] sm:inset-[18%]">
            <span className="scan-corner left-0 top-0 border-l-2 border-t-2" />
            <span className="scan-corner right-0 top-0 border-r-2 border-t-2" />
            <span className="scan-corner bottom-0 left-0 border-b-2 border-l-2" />
            <span className="scan-corner bottom-0 right-0 border-b-2 border-r-2" />
            {status === "live" ? <div className="scan-laser" /> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4" style={{ background: "linear-gradient(to top, rgb(18 36 27 / 0.72), transparent)" }}>
            <p className="text-center text-sm font-medium">
              {status === "booting"
                ? "Menyalakan kamera…"
                : status === "locked"
                  ? lockLabel
                  : status === "error"
                    ? "Kamera tidak aktif"
                    : "Arahkan barcode ke dalam bingkai"}
            </p>
            <p className="mt-1 text-center text-[11px] text-ink-muted">
              Mode berkelanjutan — scan item berikutnya tanpa menutup kamera
            </p>
          </div>
        </div>

        {error ? (
          <p className="mx-4 mt-3 rounded-xl bg-warning/15 px-3 py-2 text-sm text-warning">{error}</p>
        ) : null}

        <form
          className="mt-auto space-y-2 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const code = manual.trim();
            if (!code) return;
            handleCode(code);
            setManual("");
          }}
        >
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <Keyboard className="h-3.5 w-3.5" />
            Input manual / scanner USB
          </label>
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Nomor barcode"
              className="field flex-1 bg-ink-fg/5 font-mono text-ink-fg placeholder:text-ink-muted"
            />
            <button type="submit" className="btn-primary px-5">
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
