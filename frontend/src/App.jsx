import React, { useEffect, useMemo, useState } from "react";
import LoginScreen   from "./components/LoginScreen";
import CourseCatalog from "./components/CourseCatalog";
import CourseDetail  from "./components/CourseDetail";
import { getStudentId, fetchCourses, fetchProgress, toggleModule } from "./api";

export default function App() {
  // ── Dark mode ───────────────────────────────────────────────────────────────
  const [dark, setDark] = useState(() => localStorage.getItem("mt_dark") === "1");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("mt_dark", dark ? "1" : "0");
  }, [dark]);
  // ── Auth ────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("modulotrainer_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  function handleLogin(u) {
    localStorage.setItem("modulotrainer_user", JSON.stringify(u));
    setUser(u);
  }
  function handleLogout() {
    localStorage.removeItem("modulotrainer_user");
    setUser(null);
  }

  // ── Data ────────────────────────────────────────────────────────────────────
  const studentId = useMemo(() => getStudentId(), []);
  const [courses,    setCourses]    = useState([]);
  const [progress,   setProgress]   = useState({});
  const [activeSlug, setActiveSlug] = useState(null);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchCourses(), fetchProgress(studentId)])
      .then(([courseList, progressRows]) => {
        setCourses(courseList);
        const map = {};
        progressRows.forEach((row) => { map[row.courseSlug] = row.completedModules; });
        setProgress(map);
      })
      .catch((err) => setError(err.message));
  }, [user, studentId]);

  const coursesStarted = Object.values(progress).filter((arr) => arr.length > 0).length;
  const modulesDone    = Object.values(progress).reduce((sum, arr) => sum + arr.length, 0);
  const activeCourse   = courses.find((c) => c.slug === activeSlug);
  const isAdmin        = user?.role === "admin";

  async function handleToggleModule(moduleIndex) {
    if (!activeCourse) return;
    const updated = await toggleModule(studentId, activeCourse.slug, moduleIndex);
    setProgress((prev) => ({ ...prev, [activeCourse.slug]: updated.completedModules }));
  }

  // Callback for admin edits — replaces the updated course in state
  function handleCourseUpdated(updatedCourse) {
    setCourses((prev) =>
      prev.map((c) => (c.slug === updatedCourse.slug ? updatedCourse : c))
    );
  }
  function handleCourseCreated(newCourse) {
    setCourses((prev) => [...prev, newCourse]);
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="max-w-[1080px] mx-auto px-7 pb-20">

      {/* ── Header ── */}
      <div className="py-8 mb-9 border-b border-line flex items-end justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span
              className="w-[30px] h-[30px] rounded-full inline-block translate-y-[3px]"
              style={{ background: "conic-gradient(from -40deg, #2F6F4E, #C7902E, #2F6F4E)" }}
            />
            <h1 className="text-2xl font-semibold font-display">ModuloTrainer</h1>
          </div>
          <p className="text-muted text-sm mt-1.5 max-w-xs">
            Choose a subject, work the path one module at a time, and watch your own track of progress take shape.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Stats — shown for both roles */}
          <div className="flex gap-7">
            <div className="text-right">
              <div className="text-2xl font-semibold font-display text-forestDeep leading-none">{coursesStarted}</div>
              <div className="text-[12.5px] text-muted mt-1">tracks started</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold font-display text-forestDeep leading-none">{modulesDone}</div>
              <div className="text-[12.5px] text-muted mt-1">modules done</div>
            </div>
          </div>

          {/* Role badge + dark mode + sign-out */}
          <div className="flex items-center gap-3">
            <span className={
              "px-3 py-1 rounded-full text-xs font-semibold border " +
              (isAdmin
                ? "border-amber text-amber bg-amberSoft"
                : "border-forest text-forestDeep bg-forest/10")
            }>
              {isAdmin ? "Admin" : "Student"}: {user.username}
            </span>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink hover:border-ink transition"
            >
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.05 1.05M11.85 11.85l1.05 1.05M3.1 12.9l1.05-1.05M11.85 4.15l1.05-1.05" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-muted hover:text-ink border border-line rounded-full px-3 py-1 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* ── Feature callouts ── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-start gap-3 bg-paperRaised border border-line rounded-xl px-4 py-3 flex-1 min-w-[220px]">
          <span className="mt-0.5 w-7 h-7 rounded-full bg-amberSoft flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="2.2" stroke="#C7902E" strokeWidth="1.4"/>
              <path d="M3.5 13c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="#C7902E" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink leading-snug">No login needed</p>
            <p className="text-[12px] text-muted mt-0.5 leading-relaxed">
              A unique student ID is auto-generated and saved in your browser — progress persists across sessions without an account.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-paperRaised border border-line rounded-xl px-4 py-3 flex-1 min-w-[220px]">
          <span className="mt-0.5 w-7 h-7 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#2F6F4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink leading-snug">Progress toggle</p>
            <p className="text-[12px] text-muted mt-0.5 leading-relaxed">
              Marking a module complete saves it instantly — tap again to undo. Each toggle is a single insert or delete.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-6">
          Couldn't reach the API ({error}). Make sure the backend is running and seeded.
        </p>
      )}

      {/* ── Main content — same view, isAdmin unlocks edit controls ── */}
      {activeCourse ? (
        <CourseDetail
          course={activeCourse}
          completed={progress[activeCourse.slug] || []}
          onBack={() => setActiveSlug(null)}
          onToggleModule={handleToggleModule}
          isAdmin={isAdmin}
          onCourseUpdated={handleCourseUpdated}
          studentName={user.username}
        />
      ) : (
        <CourseCatalog
          courses={courses}
          progress={progress}
          onOpenCourse={setActiveSlug}
          isAdmin={isAdmin}
          onCourseCreated={handleCourseCreated}
        />
      )}
    </div>
  );
}
