import React, { useState } from "react";
import Module from "./Module";
import Certificate from "./Certificate";
import { adminAddModule } from "../api";

function AddModuleForm({ courseSlug, onDone, onCancel }) {
  const [title, setTitle] = useState("");
  const [time,  setTime]  = useState("");
  const [body,  setBody]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !time.trim() || !body.trim()) {
      setErr("All fields are required."); return;
    }
    setBusy(true); setErr("");
    try {
      const updated = await adminAddModule(courseSlug, { title: title.trim(), time: time.trim(), body: body.trim() });
      onDone(updated);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const inputCls = "w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition";

  return (
    <form onSubmit={handleSubmit} className="bg-paperRaised border border-forest/40 rounded-xl p-4 flex flex-col gap-3 mt-4">
      <p className="text-sm font-semibold font-display text-forestDeep">New module</p>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Module title" className={inputCls}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Time</label>
        <input value={time} onChange={e=>setTime(e.target.value)} placeholder="e.g. 30 min" className={inputCls}/>
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink mb-1">Body</label>
        <textarea rows={3} value={body} onChange={e=>setBody(e.target.value)} placeholder="Module description / content" className={inputCls}/>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="px-4 py-2 rounded-full bg-forestDeep text-white text-xs font-semibold hover:bg-forest transition disabled:opacity-50">
          {busy ? "Saving…" : "Add module"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-full border border-line text-xs font-medium hover:border-ink transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CourseDetail({ course, completed, onBack, onToggleModule, isAdmin, onCourseUpdated, studentName, studentId }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const total     = course.modules.length;
  const doneCount = completed.length;
  const pct       = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isComplete = total > 0 && doneCount === total;

  const completedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  function handleModuleAdded(updatedCourse) {
    onCourseUpdated(updatedCourse);
    setShowAddForm(false);
  }

  function handleModuleUpdated(updatedCourse) {
    onCourseUpdated(updatedCourse);
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-muted hover:text-ink mb-5 inline-flex items-center gap-1.5">
        &larr; All tracks
      </button>

      <span className="block text-xs font-semibold text-forestDeep mb-2">{course.domain}</span>
      <h2 className="text-3xl font-semibold font-display max-w-sm">{course.title}</h2>
      <p className="text-[15px] text-inkSoft mt-2.5 max-w-2xl leading-relaxed">{course.description}</p>

      <div className="flex items-center gap-3.5 my-8">
        <div className="flex-grow h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forest to-forestDeep rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-muted whitespace-nowrap tabular-nums">
          {doneCount} / {total} complete
        </span>
      </div>

      {/* Certificate — shown when 100% done, only for students */}
      {isComplete && !isAdmin && (
        <Certificate
          studentName={studentName}
          courseTitle={course.title}
          domain={course.domain}
          completedDate={completedDate}
        />
      )}

      <div className="relative pl-9 before:content-[''] before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {course.modules.map((m, idx) => (
          <Module
            key={idx}
            courseSlug={course.slug}
            index={idx}
            module={m}
            done={completed.includes(idx)}
            onToggle={() => onToggleModule(idx)}
            isAdmin={isAdmin}
            onModuleUpdated={handleModuleUpdated}
            studentId={studentId}
          />
        ))}
      </div>

      {/* Admin-only: add module */}
      {isAdmin && (
        <div className="mt-6 pl-9">
          {showAddForm ? (
            <AddModuleForm
              courseSlug={course.slug}
              onDone={handleModuleAdded}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-xl border border-dashed border-forest/40 text-sm text-forestDeep font-medium hover:border-forest hover:bg-forest/5 transition flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Add module
            </button>
          )}
        </div>
      )}
    </div>
  );
}
