import React from "react";
import CourseCard from "./CourseCard";

export default function CourseCatalog({ courses, progress, onOpenCourse }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold font-display">Pick your track</h2>
        <p className="text-sm text-muted mt-1.5 max-w-xl">
          Every course is broken into short modules you move through in order — jump in, work at your own pace, and
          pick up right where you left off.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-muted py-10 text-sm">
          No courses yet. Run <code>npm run seed</code> in the backend to load sample tracks.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
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
