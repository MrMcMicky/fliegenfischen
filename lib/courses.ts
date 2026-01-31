export type CourseLevel = "Einsteiger" | "Leicht Fortgeschritten" | "Fortgeschritten";
export type CourseCategory = "Einhand" | "Zweihand" | "Privat" | "Schnuppern";

export type SessionStatus = "verfuegbar" | "ausgebucht" | "abgesagt";

export type CourseSession = {
  id: string;
  courseSlug: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  priceCHF: number;
  availableSpots: number;
  status: SessionStatus;
  notes?: string[];
};

export type Course = {
  slug: string;
  title: string;
  level: CourseLevel;
  category: CourseCategory;
  summary: string;
  description: string;
  image?: {
    src: string;
    alt: string;
  };
  highlights: string[];
  duration: string;
  priceCHF: number;
  maxParticipants: number;
  location: string;
  equipment: string[];
  includes: string[];
  prerequisites: string[];
};

export const courses: Course[] = [
  {
    slug: "einhand-fortgeschritten",
    title: "Einhand Wurfkurs Fortgeschrittene",
    level: "Fortgeschritten",
    category: "Einhand",
    summary: "Distanz, Varianten und Kontrolle fuer erfahrene Werfer.",
    description:
      "Tageskurs fuer Fortgeschrittene: Distanz, Varianten, Fehleranalyse und effiziente Schnurkontrolle.",
    image: {
      src: "/illustrations/course-einhand.svg",
      alt: "Illustration Einhand Fliegenfischen",
    },
    highlights: [
      "Doppelzug und Distanz",
      "Backhand & Side Cast",
      "Rollwurf, Switch Cast",
      "Trick- und Praezisionswuerfe",
    ],
    duration: "09:00-16:00",
    priceCHF: 190,
    maxParticipants: 6,
    location: "Limmat (Dietikon/Wettingen)",
    equipment: [
      "Eigene Einhandrute (falls vorhanden)",
      "Wathose oder wetterfeste Kleidung",
    ],
    includes: [
      "Technik-Coaching in Kleingruppe",
      "Individuelles Feedback",
      "Optionale Leihrueten",
    ],
    prerequisites: [
      "Sicherer Grundwurf",
      "Grundlegende Schnurkontrolle",
    ],
  },
  {
    slug: "zweihand-einsteiger",
    title: "Zweihand Wurfkurs Einsteiger",
    level: "Leicht Fortgeschritten",
    category: "Zweihand",
    summary: "Schusskopf, Rollwuerfe und erste Spey-Varianten.",
    description:
      "Einsteigerkurs fuer Zweihand-Technik mit Fokus auf Schusskopf, Rollwurf und Spey-Varianten.",
    image: {
      src: "/illustrations/course-zweihand.svg",
      alt: "Illustration Zweihand Fliegenfischen",
    },
    highlights: [
      "Schusskopf-Technik",
      "Rollwurf und Single Spey",
      "Unterhandwurf",
      "Switch Cast",
    ],
    duration: "09:00-16:00",
    priceCHF: 200,
    maxParticipants: 6,
    location: "Limmat (Dietikon/Wettingen)",
    equipment: [
      "Eigene Zweihandrute (falls vorhanden)",
      "Wathose oder wetterfeste Kleidung",
    ],
    includes: [
      "Technik-Coaching in Kleingruppe",
      "Leihrueten auf Anfrage",
      "Praxisnahes Training am Wasser",
    ],
    prerequisites: ["Grundlegende Wurferfahrung hilfreich"],
  },
];

export const courseSessions: CourseSession[] = [
  {
    id: "session-2026-03-15",
    courseSlug: "einhand-fortgeschritten",
    date: "2026-03-15",
    startTime: "09:00",
    endTime: "16:00",
    location: "Dietikon/Wettingen an der Limmat",
    priceCHF: 190,
    availableSpots: 6,
    status: "verfuegbar",
    notes: [
      "Kurs findet bei jeder Witterung statt",
      "Verpflegung und Spesen nicht enthalten",
    ],
  },
  {
    id: "session-2026-03-08",
    courseSlug: "zweihand-einsteiger",
    date: "2026-03-08",
    startTime: "09:00",
    endTime: "16:00",
    location: "Dietikon/Wettingen an der Limmat",
    priceCHF: 200,
    availableSpots: 6,
    status: "verfuegbar",
    notes: [
      "Kurs findet bei jeder Witterung statt",
      "Verpflegung und Spesen nicht enthalten",
    ],
  },
];

export const categorySummaries = [
  {
    title: "Einhand",
    description: "Vom Einsteiger bis Fortgeschrittene mit sauberer Technik.",
    href: "/kurse",
  },
  {
    title: "Zweihand",
    description: "Spey, Switch Cast und effiziente Schusskopf-Fuehrung.",
    href: "/kurse",
  },
  {
    title: "Schnuppern",
    description: "2 Stunden Einstieg, ideal zum Reinschnuppern.",
    href: "/schnupperstunden",
  },
  {
    title: "Privatunterricht",
    description: "Individuelle Ziele, Fehleranalyse, flexible Termine.",
    href: "/privatunterricht",
  },
  {
    title: "Gutscheine",
    description: "Wert- oder Kursgutschein, perfekt als Geschenk.",
    href: "/gutscheine",
  },
];

export const privateLessons = {
  title: "Privatunterricht",
  priceCHF: 70,
  minHours: 2,
  additionalPersonCHF: 40,
  description:
    "Individuelles Coaching am Wasser: Technik, Fehleranalyse und klare Ziele. Termine nach Vereinbarung.",
};

export const tasterLessons = {
  title: "Schnupperstunden",
  priceCHF: 70,
  minHours: 2,
  additionalPersonCHF: 40,
  description:
    "Kurzer Einstieg: Grundtechnik, Materialkunde und erste Wuerfe.",
};

export const voucherOptions = [
  {
    title: "Wertgutschein",
    description: "Frei waehlbarer Betrag, einloesbar fuer alle Kurse.",
    values: [100, 150, 200, 250],
  },
  {
    title: "Kursgutschein",
    description: "Direkt fuer einen Kurs oder 2h Privatstunde.",
    values: [140, 190, 200],
  },
];

export const getCourseBySlug = (slug: string) =>
  courses.find((course) => course.slug === slug);

export const getSessionsForCourse = (slug: string) =>
  courseSessions.filter((session) => session.courseSlug === slug);

export const getUpcomingSessions = () =>
  [...courseSessions].sort((a, b) => a.date.localeCompare(b.date));
