import { categorySummaries } from "@/lib/courses";
import { reports } from "@/lib/reports";
import { coursePathSteps, faqs, siteConfig, uspItems } from "@/lib/site";

export const navLinks = [
  { label: "Kurse", href: "/kurse" },
  { label: "Privat", href: "/privatunterricht" },
  { label: "Ueber uns", href: "/#ueber" },
  { label: "Kontakt", href: "/kontakt" },
];

export const footerLinks = {
  offer: [
    { label: "Kursuebersicht", href: "/kurse" },
    { label: "Termine", href: "/kurse/termine" },
    { label: "Schnupperstunden", href: "/schnupperstunden" },
    { label: "Privatunterricht", href: "/privatunterricht" },
    { label: "Gutscheine", href: "/gutscheine" },
  ],
  resources: [
    { label: "Berichte", href: "/berichte" },
    { label: "FAQ", href: "/#faq" },
    { label: "Wetter", href: "/wetter" },
    { label: "Rechtliches", href: "/rechtliches" },
  ],
};

export const homeHero = {
  eyebrow: "Fliegenfischen Schule",
  title: "Fliegenfischen & Flycasting lernen in Zuerich am Wasser.",
  description:
    "Kleine Gruppen, klare Lernschritte und ein Instruktor, der Technik ruhig und praezise erklaert.",
  primaryCta: { label: "Termin buchen", href: "/kurse/termine" },
  secondaryCta: { label: "Kurse ansehen", href: "/kurse" },
};

export const aboutSection = {
  title: "Ueber Urs Mueller",
  description:
    "SFV Instruktor und EFFA Basic Flycasting Instructor. Fokus auf klare Technik, Praezision und Praxis am Wasser.",
  highlights: siteConfig.socialProof,
  note:
    "Treffpunkte entlang der Limmat, Kursmaterial auf Wunsch, klare Ablaeufe.",
};

export const homeSections = {
  upcoming: {
    eyebrow: "Termine",
    title: "Naechste Kurse",
    description:
      "Frueh buchen lohnt sich: Die Gruppen bleiben klein, die Plaetze sind limitiert.",
  },
  formats: {
    eyebrow: "Angebot",
    title: "Kursformate fuer jedes Level",
    description:
      "Einhand oder Zweihand, Privat oder Schnuppern: Wir bauen gemeinsam Technik auf, Schritt fuer Schritt.",
  },
  timeline: {
    eyebrow: "Lernpfad",
    title: "So bauen wir Technik und Praxis auf",
    description:
      "Von der Materialkunde bis zur Praxis am Wasser. Jeder Kurs bringt dich einen Schritt weiter.",
  },
  reports: {
    eyebrow: "Wissen",
    title: "Berichte und Einblicke",
    description:
      "Reiseberichte und Gewaesser-Notizen aus der Praxis. Ideal fuer SEO und Inspiration.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Haefige Fragen",
    description: "Kurz und klar beantwortet. Fuer Details gerne direkt melden.",
  },
  cta: {
    title: "Bereit fuer den naechsten Schritt?",
    description:
      "Sichere dir einen Platz oder verschenke einen Gutschein. Wir melden uns mit allen Details.",
    note: "Schnupperstunden ab CHF 70 pro Stunde, Privatunterricht flexibel.",
    primary: { label: "Termin buchen", href: "/kurse/termine" },
    secondary: { label: "Gutschein bestellen", href: "/gutscheine" },
    tertiary: { label: "Kontakt", href: "/kontakt" },
  },
  contactCard: {
    title: "Kontakt auf einen Blick",
  },
};

export const testimonials = [
  {
    quote:
      "Nach zwei Stunden sass der Doppelzug endlich. Sehr praezise Korrekturen.",
    author: "Teilnehmer Einhandkurs",
  },
  {
    quote:
      "Schnupperstunde gebucht und sofort Lust auf mehr. Ruhige Erklaerungen und viel Geduld.",
    author: "Teilnehmerin Schnupperstunde",
  },
  {
    quote:
      "Strukturierter Aufbau, kleine Gruppe, viel Feedback. Genau das habe ich gesucht.",
    author: "Teilnehmer Zweihandkurs",
  },
];

export const testimonialSection = {
  eyebrow: "Erfolge",
  title: "Klarer Aufbau, spuerbarer Fortschritt.",
  description:
    "Kleine Gruppen sorgen dafuer, dass jeder Wurf gesehen wird. Das Ziel: Technik, die auch am Wasser funktioniert.",
};

export { categorySummaries, coursePathSteps, faqs, reports, siteConfig, uspItems };
