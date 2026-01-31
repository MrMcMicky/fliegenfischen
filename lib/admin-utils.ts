export const parseLines = (value?: string | null) =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const parseJson = <T>(value?: string | null, fallback?: T) => {
  if (!value) return fallback ?? ({} as T);
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback ?? ({} as T);
  }
};
