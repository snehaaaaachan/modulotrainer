import React, { useState } from "react";
import { getModulePdfUrl, adminEditModule, adminDeleteModule } from "../api";

function EditModuleForm({ courseSlug, module, onDone, onCancel }) {
  const [title, setTitle] = useState(module.title);
  const [time,  setTime]  = useState(module.time);
  const [body,  setBody]  = useState(module.body);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !time.trim() || !body.trim()) {
      setErr("All fields are required."); return;
    }
    setBusy(true); setErr("");
    try {
      const updated = await adminEditModule(courseSlug, module.order, { title: title.trim(), time: time.trim(), body: body.trim() });
      onDone(updated);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const inputCls = "w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition";

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3" onClick={e=>e.stopPropagation()}>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} className={inputCls}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Time</label>
        <input value={time} onChange={e=>setTime(e.target.value)} className={inputCls}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Body</label>
        <textarea rows={3} value={body} onChange={e=>setBody(e.target.value)} className={inputCls}/>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="px-4 py-2 rounded-full bg-forestDeep text-white text-xs font-semibold hover:bg-forest transition disabled:opacity-50">
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-full border border-line text-xs font-medium hover:border-ink transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Module({ courseSlug, index, module, done, onToggle, isAdmin, onModuleUpdated }) {
  const [open,      setOpen]      = useState(false);
  const [showPdf,   setShowPdf]   = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const pdfUrl = getModulePdfUrl(courseSlug, index);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${module.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const updated = await adminDeleteModule(courseSlug, module.order);
      onModuleUpdated(updated);
    } catch (err) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="relative pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className={
        "absolute -left-[34px] top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[11px] font-semibold z-10 " +
        (done ? "bg-forest border-forest text-white" : "bg-paperRaised border-line text-muted")
      }>
        {done ? "✓" : index + 1}
      </div>

      <div className={"bg-paperRaised border rounded-xl px-4 py-3.5 " + (done ? "border-forest/40" : "border-line")}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setOpen((o) => !o)}>
          <div>
            <h3 className="text-[15.5px] font-semibold">{module.title}</h3>
            <div className="text-xs text-muted mt-0.5">{module.time}</div>
          </div>
          <div className="flex items-center gap-2">
            {/* Admin quick-action buttons visible even when collapsed */}
            {isAdmin && (
              <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                <button
                  onClick={e => { e.stopPropagation(); setOpen(true); setEditing(true); }}
                  className="px-2.5 py-1 rounded-lg border border-line text-[11px] text-inkSoft hover:border-forest hover:text-forestDeep transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-2.5 py-1 rounded-lg border border-line text-[11px] text-red-400 hover:border-red-400 transition disabled:opacity-40"
                >
                  {deleting ? "…" : "Delete"}
                </button>
              </div>
            )}
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={"text-muted flex-shrink-0 transition-transform " + (open ? "rotate-180" : "")}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Expanded body */}
        {open && (
          <div className="pt-3.5 text-[13.8px] text-inkSoft leading-relaxed">
            {editing ? (
              <EditModuleForm
                courseSlug={courseSlug}
                module={module}
                onDone={(updated) => { onModuleUpdated(updated); setEditing(false); }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                <p>{module.body}</p>

                <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowPdf((s) => !s); }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest inline-flex items-center gap-1.5"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 1.5h6l4 4V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V2a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M9 1.5V5a.5.5 0 0 0 .5.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    {showPdf ? "Hide module PDF" : "Read module PDF"}
                  </button>

                  <a href={pdfUrl} target="_blank" rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest">
                    Open in new tab
                  </a>

                  <a href={pdfUrl} download
                    onClick={(e) => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest">
                    Download
                  </a>

                  {/* Mark complete — hidden for admin, they don't track progress */}
                  {!isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggle(); }}
                      className={
                        "ml-auto px-3.5 py-1.5 rounded-full text-xs font-medium border transition " +
                        (done ? "bg-forest border-forest text-white" : "border-line text-ink hover:border-forest")
                      }
                    >
                      {done ? "Completed ✓" : "Mark as complete"}
                    </button>
                  )}
                </div>

                {showPdf && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-line bg-white" style={{ height: "70vh" }}>
                    <iframe
                      src={pdfUrl}
                      title={`${module.title} reading PDF`}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
