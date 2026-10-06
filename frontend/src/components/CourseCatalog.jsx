import React, { useState } from "react";
import CourseCard from "./CourseCard";
import { adminCreateCourse } from "../api";

function NewCourseForm({ onDone, onCancel }) {
  const [slug,  setSlug]  = useState("");
  const [domain,setDomain]= useState("");
  const [title, setTitle] = useState("");
  const [desc,  setDesc]  = useState("");
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!slug.trim() || !domain.trim() || !title.trim() || !desc.trim()) {
      setErr("All fields are required."); return;
    }
    setBusy(true); setErr("");
    try {
      const course = await adminCreateCourse({ slug: slug.trim(), domain: domain.trim(), title: title.trim(), description: desc.trim() });
      onDone(course);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  const inputCls = "w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition";

  return (
    <form onSubmit={handleSubmit} className="col-span-full bg-paperRaised border border-amber/60 rounded-2xl p-5 flex flex-col gap-3">
      <p className="text-sm font-semibold font-display text-amber">New track</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Slug <span className="text-muted font-normal">(URL key, no spaces)</span></label>
          <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="e.g. react-basics" className={inputCls}/>
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">Domain</label>
          <input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="e.g. Software" className={inputCls}/>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink mb-1">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Course title" className={inputCls}/>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-ink mb-1">Description</label>
          <textarea rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Short description" className={inputCls}/>
        </div>
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy}
          className="px-4 py-2 rounded-full bg-amber text-white text-xs font-semibold hover:opacity-80 transition disabled:opacity-50">
          {busy ? "Creating…" : "Create track"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-full border border-line text-xs font-medium hover:border-ink transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CourseCatalog({ courses, progress, onOpenCourse, isAdmin, onCourseCreated }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [search, setSearch] = useState("");

  function handleCreated(course) {
    onCourseCreated(course);
    setShowNewForm(false);
  }

  // Filter by course title, domain, or any module title
  const filtered = courses.filter((course) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.domain.toLowerCase().includes(q) ||
      course.modules.some((m) => m.title.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold font-display">Pick your track</h2>
          <p className="text-sm text-muted mt-1.5 max-w-xl">
            Every course is broken into short modules you move through in order — jump in, work at your own pace, and
            pick up right where you left off.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="flex-shrink-0 px-4 py-2 rounded-full border border-amber text-amber text-xs font-semibold hover:bg-amber hover:text-white transition"
          >
            {showNewForm ? "Cancel" : "+ New track"}
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses or modules…"
          className="w-full bg-paperRaised border border-line rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-forest transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {filtered.length === 0 && !showNewForm ? (
        <p className="text-center text-muted py-10 text-sm">
          {search ? `No courses or modules matching "${search}"` : "No courses yet. Run npm run seed in the backend to load sample tracks."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showNewForm && (
            <NewCourseForm onDone={handleCreated} onCancel={() => setShowNewForm(false)} />
          )}
          {filtered.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
              doneCount={(progress[course.slug] || []).length}
              onOpen={() => onOpenCourse(course.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
