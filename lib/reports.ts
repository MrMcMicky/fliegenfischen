export type Report = {
  slug: string;
  title: string;
  location: string;
  year: string;
  summary: string;
  highlights: string[];
};

export const reports: Report[] = [
  {
    slug: "island-2010",
    title: "Island 2010",
    location: "Island",
    year: "2010",
    summary:
      "Reisebericht mit Fokus auf Gewaesser, Technik und besondere Fangerlebnisse.",
    highlights: [
      "Gletscherfluesse und klare Seen",
      "Wurftechnik bei Wind",
      "Material- und Fliegenwahl",
    ],
  },
  {
    slug: "murgsee",
    title: "Murgsee",
    location: "Glarner Alpen",
    year: "2012",
    summary:
      "Hochalpiner Tagestrip mit Blick auf Wetter, Sicherheit und Gewaesserlesen.",
    highlights: [
      "Zustieg und Ausruestung",
      "Lesen von Standplaetzen",
      "Schonende Landung",
    ],
  },
  {
    slug: "fischpass-wettingen",
    title: "Fischpass Wettingen",
    location: "Limmat",
    year: "2014",
    summary:
      "Beobachtungen rund um den Fischpass und die Bedeutung von Gewaesserstrukturen.",
    highlights: [
      "Hydraulik und Stroemung",
      "Spot-Analyse",
      "Schonendes Handling",
    ],
  },
];

export const getReportBySlug = (slug: string) =>
  reports.find((report) => report.slug === slug);
