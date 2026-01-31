import { categorySummaries } from "@/lib/courses";
import { reports } from "@/lib/reports";
import { coursePathSteps, faqs, siteConfig, uspItems } from "@/lib/site";

export const navLinks = [
  { label: "Kurse", href: "/kurse" },
  { label: "Privat", href: "/privatunterricht" },
  { label: "Ueber uns", href: "/ueber-uns" },
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
    { label: "Ueber uns", href: "/ueber-uns" },
    { label: "Berichte", href: "/berichte" },
    { label: "FAQ", href: "/#faq" },
    { label: "Wetter", href: "/wetter" },
    { label: "Rechtliches", href: "/rechtliches" },
  ],
};

export const homeHero = {
  eyebrow: "Fliegenfischerschule",
  title: "Fliegenfischen in der Region Zuerich – ruhig, praezise, draussen.",
  description:
    "Kleine Gruppen, klare Lernschritte und ein Instruktor mit SFV- und EFFA-Hintergrund.",
  primaryCta: { label: "Termin sichern", href: "/kurse/termine" },
  secondaryCta: { label: "Kurse ansehen", href: "/kurse" },
};

export const aboutSection = {
  title: "Ueber Urs Mueller",
  description:
    "SFV Instruktor (2003) und EFFA Basic Flycasting Instructor (2004). Fokus auf Technik, Sicherheit und Praxis.",
  highlights: siteConfig.socialProof,
  note:
    "Treffpunkte entlang der Limmat, Kursmaterial auf Wunsch, klare Ablaeufe.",
};

export const aboutPage = {
  title: "Ueber Urs Mueller",
  intro:
    "Fliegenfischen lebt von Geduld, Technik und einem wachen Blick fuers Wasser. Genau darauf basiert der Unterricht: ruhig, strukturiert und praxisnah.",
  bio:
    "Urs Mueller unterrichtet seit vielen Jahren in der Region Zuerich und kombiniert klare Technikvermittlung mit realen Situationen am Gewaesser.",
  highlights: siteConfig.socialProof,
  values: [
    "Kleine Gruppen fuer intensives Feedback",
    "Praxis am Wasser statt nur Theorie",
    "Klare Ablaufe, nachvollziehbare Fortschritte",
  ],
  cta: {
    title: "Lust auf einen Kennenlern-Termin?",
    description:
      "Schnupperstunden oder Privatunterricht sind ideal, um Stil und Niveau abzustimmen.",
    primary: { label: "Schnuppern", href: "/schnupperstunden" },
    secondary: { label: "Kontakt aufnehmen", href: "/kontakt" },
  },
};

export const homeSections = {
  upcoming: {
    eyebrow: "Termine",
    title: "Naechste Kurse",
    description:
      "Frueh buchen lohnt sich: Die Gruppen bleiben klein und die Plaetze sind limitiert.",
  },
  formats: {
    eyebrow: "Angebot",
    title: "Kursformate fuer jedes Level",
    description:
      "Einhand oder Zweihand, Privat oder Schnuppern: Technik Schritt fuer Schritt aufbauen.",
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
      "Reiseberichte und Gewaesser-Notizen aus der Praxis. Ideal fuer Inspiration.",
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
    note: "Schnupperstunden ab CHF 70 / Std., Privatunterricht flexibel.",
    primary: { label: "Termin sichern", href: "/kurse/termine" },
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
