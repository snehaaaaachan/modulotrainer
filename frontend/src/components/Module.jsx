import React, { useState } from "react";
import { getModulePdfUrl } from "../api";

export default function Module({ courseSlug, index, module, done, onToggle }) {
  const [open, setOpen] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const pdfUrl = getModulePdfUrl(courseSlug, index);

  return (
    <div className="relative pb-6 last:pb-0">
      <div
        className={
          "absolute -left-[34px] top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[11px] font-semibold z-10 " +
          (done ? "bg-forest border-forest text-white" : "bg-paperRaised border-line text-muted")
        }
      >
        {done ? "\u2713" : index + 1}
      </div>

      <div className={"bg-paperRaised border rounded-xl px-4 py-3.5 " + (done ? "border-forest/40" : "border-line")}>
        <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setOpen((o) => !o)}>
          <div>
            <h3 className="text-[15.5px] font-semibold">{module.title}</h3>
            <div className="text-xs text-muted mt-0.5">{module.time}</div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={"text-muted flex-shrink-0 transition-transform " + (open ? "rotate-180" : "")}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {open && (
          <div className="pt-3.5 text-[13.8px] text-inkSoft leading-relaxed">
            <p>{module.body}</p>

            <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPdf((s) => !s);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest inline-flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M3 1.5h6l4 4V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V2a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M9 1.5V5a.5.5 0 0 0 .5.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                {showPdf ? "Hide module PDF" : "Read module PDF"}
              </button>

              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest"
              >
                Open in new tab
              </a>

              <a
                href={pdfUrl}
                download
                onClick={(e) => e.stopPropagation()}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-line text-ink hover:border-forest"
              >
                Download
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className={
                  "ml-auto px-3.5 py-1.5 rounded-full text-xs font-medium border transition " +
                  (done ? "bg-forest border-forest text-white" : "border-line text-ink hover:border-forest")
                }
              >
                {done ? "Completed \u2713" : "Mark as complete"}
              </button>
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
          </div>
        )}
      </div>
    </div>
  );
}
