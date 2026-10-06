import React from "react";

export default function CourseCard({ course, doneCount, onOpen }) {
  const total = course.modules.length;
  const started = doneCount > 0;

  return (
    <div
      onClick={onOpen}
      className="bg-paperRaised border border-line rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:border-forest hover:-translate-y-0.5 transition"
    >
      <span className="text-xs font-semibold text-forestDeep">{course.domain}</span>
      <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
      <p className="text-sm text-inkSoft leading-relaxed flex-grow">{course.description}</p>

      <div className="flex items-center gap-1.5">
        {course.modules.map((m, idx) => (
          <React.Fragment key={idx}>
            <span
              className={
                "w-2.5 h-2.5 rounded-full flex-shrink-0 " +
                (idx < doneCount ? "bg-forest" : idx === doneCount ? "bg-amber ring-4 ring-amberSoft" : "bg-line")
              }
            />
            {idx < total - 1 && <span className="flex-grow h-px bg-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted">
          {doneCount} of {total} modules
        </span>
        {doneCount === total && total > 0 ? (
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-forest text-white flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Completed
          </span>
        ) : (
          <button
            className={
              "px-3.5 py-1.5 rounded-full text-xs font-medium border transition " +
              (started
                ? "border-forest text-forestDeep hover:bg-forest hover:text-white"
                : "border-ink text-ink hover:bg-ink hover:text-paper")
            }
          >
            {started ? "Continue" : "Start track"}
          </button>
        )}
      </div>
    </div>
  );
}
