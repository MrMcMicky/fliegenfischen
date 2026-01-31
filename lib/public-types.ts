export type CourseLevelLabel = "Einsteiger" | "Leicht Fortgeschritten" | "Fortgeschritten";
export type CourseCategoryLabel = "Einhand" | "Zweihand" | "Privat" | "Schnuppern";
export type SessionStatusLabel = "verfügbar" | "ausgebucht" | "abgesagt";

export const courseLevelLabels: Record<string, CourseLevelLabel> = {
  EINSTEIGER: "Einsteiger",
  LEICHT_FORTGESCHRITTEN: "Leicht Fortgeschritten",
  FORTGESCHRITTEN: "Fortgeschritten",
};

export const courseCategoryLabels: Record<string, CourseCategoryLabel> = {
  EINHAND: "Einhand",
  ZWEIHAND: "Zweihand",
  PRIVAT: "Privat",
  SCHNUPPERN: "Schnuppern",
};

export const sessionStatusLabels: Record<string, SessionStatusLabel> = {
  VERFUEGBAR: "verfügbar",
  AUSGEBUCHT: "ausgebucht",
  ABGESAGT: "abgesagt",
};
