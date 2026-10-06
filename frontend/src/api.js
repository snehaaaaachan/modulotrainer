const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ── Student identity ──────────────────────────────────────────────────────────
// A persistent random ID stored in localStorage. Swap for a real user ID once
// proper auth exists.
export function getStudentId() {
  let id = localStorage.getItem("modulotrainer_student_id");
  if (!id) {
    id = "student_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("modulotrainer_student_id", id);
  }
  return id;
}

// ── Public course / progress API ──────────────────────────────────────────────
export async function fetchCourses() {
  const res = await fetch(`${API_URL}/courses`);
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export async function fetchCourse(slug) {
  const res = await fetch(`${API_URL}/courses/${slug}`);
  if (!res.ok) throw new Error("Failed to load course");
  return res.json();
}

export async function fetchProgress(studentId) {
  const res = await fetch(`${API_URL}/progress/${studentId}`);
  if (!res.ok) throw new Error("Failed to load progress");
  return res.json();
}

export function getModulePdfUrl(courseSlug, moduleIndex) {
  return `${API_URL}/courses/${courseSlug}/modules/${moduleIndex}/pdf`;
}

export async function toggleModule(studentId, courseSlug, moduleIndex) {
  const res = await fetch(`${API_URL}/progress/${studentId}/${courseSlug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moduleIndex })
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
}

// ── Admin API (requires x-role: admin header) ─────────────────────────────────
const adminHeaders = {
  "Content-Type": "application/json",
  "x-role": "admin"
};

export async function adminCreateCourse(data) {
  const res = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create course");
  return json;
}

export async function adminAddModule(courseSlug, data) {
  const res = await fetch(`${API_URL}/courses/${courseSlug}/modules`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to add module");
  return json;
}

export async function adminEditModule(courseSlug, moduleIndex, data) {
  const res = await fetch(`${API_URL}/courses/${courseSlug}/modules/${moduleIndex}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to edit module");
  return json;
}

export async function adminDeleteModule(courseSlug, moduleIndex) {
  const res = await fetch(`${API_URL}/courses/${courseSlug}/modules/${moduleIndex}`, {
    method: "DELETE",
    headers: adminHeaders
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete module");
  return json;
}

export async function adminUploadPdf(courseSlug, moduleIndex, file) {
  const formData = new FormData();
  formData.append("pdf", file);
  // Note: do NOT set Content-Type header — browser sets it with boundary automatically
  const res = await fetch(`${API_URL}/courses/${courseSlug}/modules/${moduleIndex}/pdf`, {
    method: "POST",
    headers: { "x-role": "admin" },
    body: formData
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to upload PDF");
  return json;
}
