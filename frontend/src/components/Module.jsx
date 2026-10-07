import React, { useRef, useState } from "react";
import { getModulePdfUrl, adminEditModule, adminDeleteModule, adminUploadPdf } from "../api";
import { useNote } from "../useNotes";
import { useLastSeen, getLastSeenLabel } from "../useLastSeen";
import Quiz       from "./Quiz";
import QuizEditor from "./QuizEditor";

function NotepadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M2.5 4.5h-1a1 1 0 0 0 0 2h1M2.5 8.5h-1a1 1 0 0 0 0 2h1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

function EditModuleForm({ courseSlug, module, onDone, onCancel }) {
  const [title, setTitle] = useState(module.title);
  const [time,  setTime]  = useState(module.time);
  const [body,  setBody]  = useState(module.body);
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !time.trim() || !body.trim()) { setErr("All fields are required."); return; }
    setBusy(true); setErr("");
    try {
      const updated = await adminEditModule(courseSlug, module.order, { title: title.trim(), time: time.trim(), body: body.trim() });
      onDone(updated);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const cls = "w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition";
  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
      <div><label className="block text-xs font-semibold text-ink mb-1">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className={cls}/></div>
      <div><label className="block text-xs font-semibold text-ink mb-1">Time</label><input value={time} onChange={e=>setTime(e.target.value)} className={cls}/></div>
      <div><label className="block text-xs font-semibold text-ink mb-1">Body</label><textarea rows={3} value={body} onChange={e=>setBody(e.target.value)} className={cls}/></div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="px-4 py-2 rounded-full bg-forestDeep text-white text-xs font-semibold hover:bg-forest transition disabled:opacity-50">{busy?"Saving…":"Save changes"}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-full border border-line text-xs font-medium hover:border-ink transition">Cancel</button>
      </div>
    </form>
  );
}

export default function Module({ courseSlug, index, module, done, onToggle, isAdmin, onModuleUpdated, studentId }) {
  const [open,       setOpen]       = useState(false);
  const [showPdf,    setShowPdf]    = useState(false);
  const [showNote,   setShowNote]   = useState(false);
  const [showQuiz,   setShowQuiz]   = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState("");
  const fileInputRef = useRef(null);
  const pdfUrl = getModulePdfUrl(courseSlug, index);

  const [note, setNote] = useNote(studentId || "guest", courseSlug, index);
  const hasNote = note.trim().length > 0;

  // Record last seen when module is opened
  useLastSeen(open ? courseSlug : null, open ? index : null);
  const lastSeenLabel = getLastSeenLabel(courseSlug, index);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${module.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { const u = await adminDeleteModule(courseSlug, module.order); onModuleUpdated(u); }
    catch (err) { alert("Failed to delete: " + err.message); setDeleting(false); }
  }

  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setUploadErr("");
    try { const u = await adminUploadPdf(courseSlug, module.order, file); onModuleUpdated(u); }
    catch (err) { setUploadErr(err.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
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
        <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div>
            <h3 className="text-[15.5px] font-semibold">{module.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted">{module.time}</span>
              {lastSeenLabel && !isAdmin && (
                <span className="text-[11px] text-muted/70">· last seen {lastSeenLabel}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Student: notepad icon */}
            {!isAdmin && (
              <button onClick={e => { e.stopPropagation(); setOpen(true); setShowNote(s => !s); }}
                aria-label="Toggle notes"
                className="relative w-7 h-7 rounded-lg flex items-center justify-center border border-line text-muted hover:border-amber hover:text-amber transition">
                <NotepadIcon />
                {hasNote && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber border-2 border-paperRaised"/>}
              </button>
            )}

            {/* Admin: edit/delete */}
            {isAdmin && (
              <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                <button onClick={e => { e.stopPropagation(); setOpen(true); setEditing(true); }}
                  className="px-2.5 py-1 rounded-lg border border-line text-[11px] text-inkSoft hover:border-forest hover:text-forestDeep transition">
                  Edit
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-2.5 py-1 rounded-lg border border-line text-[11px] text-red-400 hover:border-red-400 transition disabled:opacity-40">
                  {deleting ? "…" : "Delete"}
                </button>
              </div>
            )}

            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
              className={"text-muted flex-shrink-0 transition-transform " + (open ? "rotate-180" : "")}>
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Expanded body */}
        {open && (
          <div className="pt-3.5 text-[13.8px] text-inkSoft leading-relaxed">
            {editing ? (
              <EditModuleForm courseSlug={courseSlug} module={module}
                onDone={u => { onModuleUpdated(u); setEditing(false); }}
                onCancel={() => setEditing(false)}/>
            ) : (
              <>
                <p>{module.body}</p>

                {/* Notes panel — student only */}
                {!isAdmin && showNote && (
                  <div className="mt-4 rounded-xl border border-amber/40 bg-amberSoft/20 p-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2 mb-2">
                      <NotepadIcon/>
                      <span className="text-xs font-semibold text-amber">My notes</span>
                      <span className="ml-auto text-[10px] text-muted">{note.length > 0 ? "Saved" : "Start typing…"}</span>
                    </div>
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                      placeholder="Jot down anything from this module — key points, questions, ideas…"
                      rows={4}
                      className="w-full bg-paper border border-amber/30 rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-amber transition resize-none"/>
                    {note.trim() && (
                      <button onClick={() => setNote("")}
                        className="mt-1.5 text-[11px] text-muted hover:text-red-400 transition">Clear note</button>
                    )}
                  </div>
                )}

                {/* Action buttons row */}
                <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
                  <button onClick={e => { e.stopPropagation(); setShowPdf(s => !s); }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest inline-flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 1.5h6l4 4V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V2a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M9 1.5V5a.5.5 0 0 0 .5.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                    {showPdf ? "Hide module PDF" : "Read module PDF"}
                  </button>

                  <a href={pdfUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest">
                    Open in new tab
                  </a>

                  <a href={pdfUrl} download onClick={e => e.stopPropagation()}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest">
                    Download
                  </a>

                  {/* Take quiz — student only */}
                  {!isAdmin && (
                    <button onClick={e => { e.stopPropagation(); setShowQuiz(s => !s); }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-forest/50 text-forestDeep hover:bg-forest hover:text-white transition inline-flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M6.5 6.5C6.5 5.67 7.17 5 8 5s1.5.67 1.5 1.5c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        <circle cx="8" cy="11" r=".6" fill="currentColor"/>
                      </svg>
                      {showQuiz ? "Hide quiz" : "Take quiz"}
                    </button>
                  )}
                  {!isAdmin && (
                    <button onClick={e => { e.stopPropagation(); onToggle(); }}
                      className={
                        "ml-auto px-3.5 py-1.5 rounded-full text-xs font-medium border transition " +
                        (done ? "bg-forest border-forest text-white" : "border-line text-ink hover:border-forest")
                      }>
                      {done ? "Completed ✓" : "Mark as complete"}
                    </button>
                  )}

                  {/* Upload PDF — admin only */}
                  {isAdmin && (
                    <div className="ml-auto flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload}/>
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-amber text-amber hover:bg-amber hover:text-white transition disabled:opacity-50 inline-flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M8 11V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                        {uploading ? "Uploading…" : module.pdfFile ? "Replace PDF" : "Upload PDF"}
                      </button>
                      {uploadErr && <span className="text-xs text-red-500">{uploadErr}</span>}
                    </div>
                  )}
                </div>

                {/* PDF viewer */}
                {showPdf && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-line bg-white" style={{ height: "70vh" }}>
                    <iframe src={pdfUrl} title={`${module.title} reading PDF`} className="w-full h-full" style={{ border: "none" }}/>
                  </div>
                )}

                {/* Quiz — student */}
                {!isAdmin && showQuiz && (
                  <Quiz courseSlug={courseSlug} moduleIndex={index} onPassed={() => {}} />
                )}

                {/* Quiz editor — admin */}
                {isAdmin && (
                  <QuizEditor courseSlug={courseSlug} moduleIndex={index} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
