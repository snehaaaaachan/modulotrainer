import React from "react";
import Module from "./Module";

export default function CourseDetail({ course, completed, onBack, onToggleModule }) {
  const total = course.modules.length;
  const doneCount = completed.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

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

      <div className="relative pl-9 before:content-[''] before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {course.modules.map((m, idx) => (
          <Module
            key={idx}
            courseSlug={course.slug}
            index={idx}
            module={m}
            done={completed.includes(idx)}
            onToggle={() => onToggleModule(idx)}
          />
        ))}
      </div>
    </div>
  );
}
