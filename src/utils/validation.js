// ─── Field-level validators ───────────────────────────────────────────────────
// Each function returns null (valid) or an error string (invalid).

// ── Auth ──────────────────────────────────────────────────────────────────────

export function validateEmail(value) {
  if (!value?.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Enter a valid email address";
  return null;
}
