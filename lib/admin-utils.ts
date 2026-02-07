export const parseLines = (value?: string | null) =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const slugify = (value: string) => {
  const cleaned = (value || "")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "kurs";
};

export const parseJson = <T>(value?: string | null, fallback?: T) => {
  if (!value) return fallback ?? ({} as T);
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback ?? ({} as T);
  }
};
