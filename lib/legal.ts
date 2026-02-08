export type LegalSection = {
  title: string;
  paragraphs: string[];
  lines?: string[];
};

export type LegalContent = {
  title: string;
  intro?: string;
  updatedAt?: string;
  sections: LegalSection[];
};

type LegalContact = {
  instructor: string;
  address: string[];
  phone: string;
  mobile: string;
  email: string;
};

const formatUpdatedAt = () =>
  new Intl.DateTimeFormat("de-CH", {
    month: "long",
    year: "numeric",
  }).format(new Date());

export const buildLegalContent = ({
  siteName,
  contact,
}: {
  siteName: string;
  contact: LegalContact;
}): LegalContent => {
  const addressLines = (contact.address || []).filter(Boolean);
  const contactLines = [
    `Anbieter: ${siteName}`,
    contact.instructor ? `Verantwortlich: ${contact.instructor}` : null,
    ...addressLines,
    contact.phone ? `Tel. ${contact.phone}` : null,
    contact.mobile ? `Natel ${contact.mobile}` : null,
    contact.email ? `E-Mail: ${contact.email}` : null,
  ].filter(Boolean) as string[];

  return {
    title: "Rechtliches",
    intro:
      "Kurz & transparent: die wichtigsten Informationen zu Datenschutz, Buchungen und Anbieterangaben.",
    updatedAt: `Stand: ${formatUpdatedAt()}`,
    sections: [
      {
        title: "Impressum",
        paragraphs: [
          "Angaben gemäss Schweizer Recht (UWG Art. 3 Abs. 1 lit. s):",
        ],
        lines: contactLines,
      },
      {
        title: "Datenschutz",
        paragraphs: [
          "Wir bearbeiten personenbezogene Daten (z. B. Name, Kontaktdaten, Nachricht, Buchungs- und Zahlungsinformationen), um Anfragen zu beantworten, Buchungen durchzuführen und unsere Leistungen zu erbringen.",
          "Für die Zahlungsabwicklung nutzen wir Stripe. Zahlungsdaten werden direkt bei Stripe verarbeitet; wir erhalten keine vollständigen Karten- oder TWINT‑Zahlungsdaten.",
          "Wir setzen Dienstleister (Hosting, E‑Mail, Zahlungsanbieter) ein. Diese erhalten Daten nur, soweit dies zur Leistungserbringung erforderlich ist.",
          "Daten können in Länder ausserhalb der Schweiz/EU übermittelt werden. Dabei werden geeignete Garantien eingesetzt (z. B. Standarddatenschutzklauseln).",
          "Wir speichern Daten so lange, wie es für den Zweck erforderlich ist und soweit gesetzliche Aufbewahrungspflichten bestehen.",
          "Betroffene Personen haben das Recht auf Auskunft, Berichtigung und Löschung. Anfragen bitte an die oben genannte Kontaktadresse.",
        ],
      },
      {
        title: "Buchung & Storno",
        paragraphs: [
          "Mit der Termin‑/Buchungsbestätigung kommt eine verbindliche Buchung zustande. Preise und Leistungen ergeben sich aus der jeweiligen Offerte oder Buchungsbestätigung.",
          "Umbuchungen oder Stornos sind bitte frühzeitig mitzuteilen. Es gelten die bei der Buchung kommunizierten Bedingungen.",
        ],
      },
      {
        title: "Haftung & externe Links",
        paragraphs: [
          "Externe Links liegen ausserhalb unseres Einflussbereichs. Für Inhalte Dritter übernehmen wir keine Verantwortung.",
          "Soweit gesetzlich zulässig, ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.",
        ],
      },
    ],
  };
};
