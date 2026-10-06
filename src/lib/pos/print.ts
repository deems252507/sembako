/** Buka jendela cetak yang andal (hindari about:blank kosong). */
export function openPrintHtml(
  html: string,
  opts?: { width?: number; height?: number },
): boolean {
  const width = opts?.width ?? 360;
  const height = opts?.height ?? 640;
  const win = window.open("", "_blank", `noopener,noreferrer,width=${width},height=${height}`);
  if (!win) return false;

  try {
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch {
    try {
      win.close();
    } catch {
      /* ignore */
    }
    return false;
  }

  const tryPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
  };

  // Beberapa browser butuh jeda singkat agar layout siap
  if (win.document.readyState === "complete") {
    window.setTimeout(tryPrint, 200);
  } else {
    win.onload = () => window.setTimeout(tryPrint, 150);
    window.setTimeout(tryPrint, 600);
  }
  return true;
}

export function esc(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function thermalShell(title: string, bodyInner: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;width:280px;margin:0 auto;padding:14px 12px;color:#111;line-height:1.35}
  .center{text-align:center}
  .bold{font-weight:700}
  .muted{color:#555;font-size:11px}
  .row{display:flex;justify-content:space-between;gap:8px;margin:2px 0}
  .row span:first-child{flex:1;word-break:break-word}
  .row span:last-child{white-space:nowrap}
  hr{border:none;border-top:1px dashed #333;margin:8px 0}
  .store{font-size:15px;font-weight:700;letter-spacing:.2px}
  .total{font-size:13px;font-weight:700;margin-top:2px}
  .tag{display:inline-block;margin-top:6px;padding:2px 8px;border:1px solid #b45309;color:#b45309;font-weight:700;font-size:11px}
  @media print{body{padding:0}}
</style></head><body>
${bodyInner}
</body></html>`;
}

export function a4Shell(title: string, bodyInner: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
  @page{size:A4;margin:14mm}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"Segoe UI",Tahoma,Arial,sans-serif;font-size:12px;color:#1a1a1a;line-height:1.45;padding:8px}
  h1{font-size:18px;margin:0}
  .sub{color:#555;margin:4px 0 16px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th,td{border:1px solid #ddd;padding:8px;text-align:left}
  th{background:#f5f5f5}
  .cards{display:flex;gap:12px;margin:16px 0;flex-wrap:wrap}
  .card{border:1px solid #ddd;border-radius:8px;padding:12px;flex:1;min-width:140px}
  .card b{display:block;font-size:15px;margin-top:4px}
</style></head><body>
${bodyInner}
</body></html>`;
}
