// frontend/csrf.js
export function getCSRFToken() {
  const el = document.querySelector('meta[name="csrf-token"]');
  return el && el.content;
}
