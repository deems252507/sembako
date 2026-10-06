let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function playScanBeep(kind: "ok" | "miss" | "dup" = "ok") {
  const ac = audio();
  if (!ac) return;
  void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.value = kind === "ok" ? 880 : kind === "dup" ? 640 : 220;
  gain.gain.value = 0.07;
  osc.connect(gain);
  gain.connect(ac.destination);
  const now = ac.currentTime;
  gain.gain.setValueAtTime(0.07, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.start(now);
  osc.stop(now + 0.13);
}
