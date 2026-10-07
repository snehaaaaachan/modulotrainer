import { useEffect } from "react";

// Records when a module was last opened.
// Pass null for either arg to skip recording (e.g. when module is closed).
export function useLastSeen(courseSlug, moduleIndex) {
  useEffect(() => {
    if (courseSlug == null || moduleIndex == null) return;
    const key = `mt_seen_${courseSlug}_${moduleIndex}`;
    localStorage.setItem(key, Date.now().toString());
  }, [courseSlug, moduleIndex]);
}

// Returns a human-readable "X ago" label, or null if never seen
export function getLastSeenLabel(courseSlug, moduleIndex) {
  const key   = `mt_seen_${courseSlug}_${moduleIndex}`;
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  const diffMs   = Date.now() - Number(saved);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1)   return "just now";
  if (diffMins < 60)  return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHrs  < 24)  return `${diffHrs} hr${diffHrs === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}
