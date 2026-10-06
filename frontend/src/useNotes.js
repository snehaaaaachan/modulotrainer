import { useCallback, useEffect, useState } from "react";

// Returns [note, setNote] backed by localStorage.
// Key format: mt_note_{studentId}_{courseSlug}_{moduleIndex}
export function useNote(studentId, courseSlug, moduleIndex) {
  const key = `mt_note_${studentId}_${courseSlug}_${moduleIndex}`;

  const [note, setNoteState] = useState(() => localStorage.getItem(key) || "");

  const setNote = useCallback(
    (val) => {
      setNoteState(val);
      if (val.trim()) {
        localStorage.setItem(key, val);
      } else {
        localStorage.removeItem(key);
      }
    },
    [key]
  );

  // Sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === key) setNoteState(e.newValue || "");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [note, setNote];
}

// Returns all notes for a student as [{ courseSlug, moduleIndex, text }, ...]
export function getAllNotes(studentId) {
  const prefix = `mt_note_${studentId}_`;
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      const rest = k.slice(prefix.length);           // "webdev_2"
      const lastUnderscore = rest.lastIndexOf("_");
      const courseSlug  = rest.slice(0, lastUnderscore);
      const moduleIndex = Number(rest.slice(lastUnderscore + 1));
      const text = localStorage.getItem(k) || "";
      if (text.trim()) results.push({ courseSlug, moduleIndex, text });
    }
  }
  return results;
}
