import React, { useRef } from "react";

export default function Certificate({ studentName, courseTitle, domain, completedDate }) {
  const certRef = useRef(null);

  function handleDownload() {
    const el = certRef.current;
    if (!el) return;

    // Use html2canvas-like approach via canvas — no external lib needed
    // We'll open a new window with a print-ready version instead
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Certificate — ${courseTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:'IBM Plex Sans',sans-serif; }
  .cert {
    width: 760px; padding: 56px 64px;
    border: 2px solid #D3DBD1;
    border-radius: 20px;
    text-align: center;
    position: relative;
    background: #F8FAF6;
  }
  .cert::before {
    content:'';
    position:absolute; inset:10px;
    border: 1px solid #D3DBD1;
    border-radius:14px;
    pointer-events:none;
  }
  .seal { margin: 0 auto 28px; width:72px; height:72px; }
  .domain { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#2F6F4E; margin-bottom:8px; }
  .headline { font-family:'Fraunces',Georgia,serif; font-size:13px; color:#6E7D75; margin-bottom:6px; }
  .name { font-family:'Fraunces',Georgia,serif; font-size:38px; font-weight:700; color:#16241F; margin-bottom:16px; line-height:1.1; }
  .body { font-size:14px; color:#3B4A44; line-height:1.6; max-width:480px; margin:0 auto 28px; }
  .course { font-family:'Fraunces',Georgia,serif; font-size:22px; font-weight:600; color:#1F5138; }
  .divider { width:60px; height:2px; background:linear-gradient(90deg,#2F6F4E,#C7902E); margin:24px auto; border-radius:2px; }
  .date { font-size:12px; color:#6E7D75; margin-top:6px; }
  .footer { margin-top:32px; display:flex; justify-content:center; gap:60px; }
  .sig-line { width:120px; height:1px; background:#D3DBD1; margin:0 auto 6px; }
  .sig-label { font-size:11px; color:#6E7D75; }
  @media print { body { min-height:unset; } }
</style>
</head>
<body>
<div class="cert">
  <div class="seal">
    <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" stroke="#2F6F4E" stroke-width="2"/>
      <circle cx="36" cy="36" r="28" stroke="#C7902E" stroke-width="1" stroke-dasharray="4 3"/>
      <path d="M36 16l3.09 9.51H49l-8.09 5.88 3.09 9.51L36 35.02l-7.99 5.88 3.09-9.51L23 25.51h9.91z" fill="#C7902E"/>
      <path d="M26 46l2 8h16l2-8" stroke="#2F6F4E" stroke-width="1.5" stroke-linejoin="round" fill="#EFF2ED"/>
    </svg>
  </div>
  <div class="domain">${domain}</div>
  <div class="headline">This certifies that</div>
  <div class="name">${studentName}</div>
  <div class="body">has successfully completed all modules of</div>
  <div class="course">${courseTitle}</div>
  <div class="divider"></div>
  <div class="date">Awarded on ${completedDate}</div>
  <div class="footer">
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">ModuloTrainer</div>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Date of Completion</div>
    </div>
  </div>
</div>
<script>window.onload=()=>window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Revoke after a delay so the new window can load it
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return (
    <div
      ref={certRef}
      className="relative bg-paperRaised border-2 border-forest/30 rounded-2xl px-8 py-10 text-center mb-10 overflow-hidden"
    >
      {/* Corner decorations */}
      <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber/60 rounded-tl-lg" />
      <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber/60 rounded-tr-lg" />
      <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber/60 rounded-bl-lg" />
      <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber/60 rounded-br-lg" />

      {/* Seal */}
      <div className="mx-auto mb-4 w-16 h-16">
        <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="34" stroke="#2F6F4E" strokeWidth="2"/>
          <circle cx="36" cy="36" r="28" stroke="#C7902E" strokeWidth="1" strokeDasharray="4 3"/>
          <path d="M36 16l3.09 9.51H49l-8.09 5.88 3.09 9.51L36 35.02l-7.99 5.88 3.09-9.51L23 25.51h9.91z" fill="#C7902E"/>
          <path d="M26 46l2 8h16l2-8" stroke="#2F6F4E" strokeWidth="1.5" strokeLinejoin="round" fill="#EFF2ED"/>
        </svg>
      </div>

      {/* Domain pill */}
      <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-forestDeep mb-3">
        {domain}
      </span>

      {/* Text */}
      <p className="text-sm text-muted mb-1">This certifies that</p>
      <h2 className="text-3xl font-semibold font-display text-ink mb-3 leading-tight">{studentName}</h2>
      <p className="text-sm text-inkSoft mb-2">has successfully completed all modules of</p>
      <p className="text-xl font-semibold font-display text-forestDeep mb-4">{courseTitle}</p>

      {/* Divider */}
      <div className="w-12 h-0.5 mx-auto mb-4 rounded-full" style={{ background: "linear-gradient(90deg,#2F6F4E,#C7902E)" }} />

      <p className="text-xs text-muted mb-6">Awarded on {completedDate}</p>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forestDeep text-white text-xs font-semibold hover:bg-forest transition"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v7M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Download Certificate
        </button>
      </div>
    </div>
  );
}
