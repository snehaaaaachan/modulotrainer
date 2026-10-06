const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// A student identifier stored in the browser. Swap this out once real auth exists.
export function getStudentId() {
  let id = localStorage.getItem("modulotrainer_student_id");
  if (!id) {
    id = "student_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("modulotrainer_student_id", id);
  }
  return id;
}

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

// Direct URL to a module's reading PDF, served inline by the backend so it can
// sit inside an <iframe> as well as be opened/downloaded on its own.
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
