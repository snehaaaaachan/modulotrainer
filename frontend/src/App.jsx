import React, { useEffect, useMemo, useState } from "react";
import CourseCatalog from "./components/CourseCatalog";
import CourseDetail from "./components/CourseDetail";
import { getStudentId, fetchCourses, fetchProgress, toggleModule } from "./api";

export default function App() {
  const studentId = useMemo(() => getStudentId(), []);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({}); // { [courseSlug]: number[] }
  const [activeSlug, setActiveSlug] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchProgress(studentId)])
      .then(([courseList, progressRows]) => {
        setCourses(courseList);
        const map = {};
        progressRows.forEach((row) => {
          map[row.courseSlug] = row.completedModules;
        });
        setProgress(map);
      })
      .catch((err) => setError(err.message));
  }, [studentId]);

  const coursesStarted = Object.values(progress).filter((arr) => arr.length > 0).length;
  const modulesDone = Object.values(progress).reduce((sum, arr) => sum + arr.length, 0);

  const activeCourse = courses.find((c) => c.slug === activeSlug);

  async function handleToggleModule(moduleIndex) {
    if (!activeCourse) return;
    const updated = await toggleModule(studentId, activeCourse.slug, moduleIndex);
    setProgress((prev) => ({ ...prev, [activeCourse.slug]: updated.completedModules }));
  }

  return (
    <div className="max-w-[1080px] mx-auto px-7 pb-20">
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
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-6">
          Couldn't reach the API ({error}). Make sure the backend is running and seeded.
        </p>
      )}

      {activeCourse ? (
        <CourseDetail
          course={activeCourse}
          completed={progress[activeCourse.slug] || []}
          onBack={() => setActiveSlug(null)}
          onToggleModule={handleToggleModule}
        />
      ) : (
        <CourseCatalog courses={courses} progress={progress} onOpenCourse={setActiveSlug} />
      )}
    </div>
  );
}
