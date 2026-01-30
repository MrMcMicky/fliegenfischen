# Konzept: Fliegenfischen (Next.js + Stripe)

Stand: 2026-01-30

## 1) Ist-Analyse (fliegenfischer-schule.ch)

### 1.1 Positionierung & erster Eindruck
- Klare Botschaft: Fliegenfischen lernen mit Instruktor Urs Mueller, Standort Region Zuerich/Geroldswil.
- Kontaktinfos (Telefon/Natel/E-Mail/Adresse) oben auf den Seiten -> Vertrauensaufbau und schnelle Kontaktaufnahme.
- Primarer CTA fuehrt zu Kursdaten/Preise.

Quelle: https://www.fliegenfischer-schule.ch/

### 1.2 Navigation (Status quo)
- Startseite, Ueber mich, Kursangebote, Bilder und Berichte, Links, SFV, Wetter, Aktuelles.
- Unter Kursangebote: Kursdaten/Preise, Einsteiger, Fortgeschrittene, Gutscheine, Schnupperstunden, Privatstunden, Kursaufbau, Kursanmeldung.

Quelle: https://www.fliegenfischer-schule.ch/kursdaten.html

### 1.3 Kurse & Inhalte (sichtbar)
- Kursdaten/Preise zeigen konkrete Termine, Uhrzeiten, Preise, Gruppenlimit und Ort (Limmat/Dietikon/Wettingen). Aktuell:
  - Kurs 1 (Fortgeschrittene Einhand): So 2026-03-15, 09:00-16:00, CHF 190
  - Kurs 2 (Zweihand Einsteiger/leicht Fortgeschrittene): So 2026-03-08, 09:00-16:00, CHF 200
  - Max. 6 Personen, findet bei jeder Witterung statt, Ausruestung kann gestellt werden, Verpflegung nicht enthalten.
- Schnupperstunden: mind. 2h, Preis CHF 70/Std. (1 Person), jede weitere Person CHF 40/Std.
- Privatstunden: mind. 2h, individuell, aehnliche Preislogik wie Schnuppern.
- Gutscheine: manuell erstellt, unbefristet gueltig.
- Kursaufbau: Stufen 1-5 (Theorie bis Praxis am Wasser) = hochwertiger SEO-Content.

Quellen:
- https://www.fliegenfischer-schule.ch/kursdaten.html
- https://www.fliegenfischer-schule.ch/schnupperstunden.html
- https://www.fliegenfischer-schule.ch/Privatstunden.html
- https://www.fliegenfischer-schule.ch/gutscheine-privatstunden.html
- https://www.fliegenfischer-schule.ch/kursaufbau.html

### 1.4 Vertrauen & Qualifikation
- Ueber mich beschreibt SFV Instruktorenpruefung 2003 und EFFA Basic Flycasting Instructor 2004.
- Auf der Startseite wird EFFA noch als aktuelle Zertifizierung genannt -> im Relaunch sauberer formulieren (z.B. Pruefung 2004, heute Fokus SFV).

Quellen:
- https://www.fliegenfischer-schule.ch/ueber-mich.html
- https://www.fliegenfischer-schule.ch/

### 1.5 Conversion- und Modernitaetsbremse
- Anmeldung ohne Online-Payment; Zahlung via Bankueberweisung.
- Kursdaten als Textblock = fehleranfaelliges Management.
- Rechtliches (AGB/Datenschutz/Impressum) nicht prominent in der Navigation.

Quellen:
- https://www.fliegenfischer-schule.ch/kursanmeldung.html
- https://www.fliegenfischer-schule.ch/

### 1.6 Content/SEO-Potenzial
- Berichte/Fotoalben (z.B. Island 2010) bieten starke Inhalte, wirken aber alt.

Quelle: https://www.fliegenfischer-schule.ch/island-2010.html

## 2) Zielbild

### Primaere Ziele
1) Mehr Kursbuchungen inkl. Sofortzahlung
2) Mehr Gutscheinverkaeufe
3) Inhalte/Kurse ohne Entwickler pflegen
4) SEO halten und ausbauen

### Sekundaere Ziele
- Professioneller, moderner Auftritt (Schweiz, Outdoor)
- Automatisierung: Bestaetigungs-Mails, Teilnehmerlisten, Erinnerungen
- Messbarkeit fuer Ads/SEO

## 3) Neue Informationsarchitektur (IA)

Top-Level:
- Start
- Kurse (Uebersicht, Kategorien, Detailseiten, Termine)
- Privatunterricht
- Schnupperstunden
- Gutscheine
- Ueber Urs
- Wissen & Berichte (Blog/Galerie)
- Kontakt
- Rechtliches (Datenschutz, AGB/Storno, Impressum)

Ziel: klare Landingpages fuer Suchintents + klare CTAs (Buchen / Gutschein).

## 4) Datenmodell (MVP + skalierbar)

Course (Kurs-Typ)
- titel, slug, level (Einsteiger/Fortgeschrittene), kategorie (Einhand/Zweihand/Privat/Schnuppern)
- beschreibung, lernziele, inhalte (Listen)
- dauer, preis, maxTeilnehmer
- locations, ausruestung, faq

CourseSession (Termin)
- datum, uhrzeit, freiePlaetze, status (verfuegbar/ausgebucht/abgesagt)
- optional: partner/organisator + buchungsmodus (intern/extern)

Booking
- teilnehmerdaten, anzahl, courseSessionId
- zahlungsstatus (pending/paid/refunded)
- stripe checkout session id
- einwilligungen (AGB/Datenschutz)

Voucher
- code, typ (wert/kurs), betrag/kurs, restwert, status
- optional: empfaengername, persoenlicher text, versanddatum

## 5) Buchungs- und Zahlungsfluss

1) Kursdetail -> Termin waehlen
2) Formular (Name, E-Mail, Telefon, optional Adresse)
3) Checkboxen: AGB/Datenschutz, Storno, Unfallversicherung Hinweis
4) Stripe Checkout
5) Erfolg: Bestaetigungsseite + E-Mail (Treffpunkt, Ausruestung, ICS)

Zahlungen: Stripe Checkout inkl. TWINT fuer CH. Quelle: https://stripe.com/payment-method/twint

## 6) Gutscheine (modern)

- Wertgutschein (CHF 100/200/frei)
- Kursgutschein (z.B. Einsteigerkurs, 2h Privatstunde)
- PDF-Gutschein + Code + optionaler Terminversand
- Einloesung im Checkout, Restwert bleibt erhalten

## 7) SEO-Migration

- 301 Redirect Mapping fuer alle wichtigen Alt-URLs
- Event-Markup fuer Termine, LocalBusiness, FAQ Schema
- Sitemap + Robots + Canonicals

Beispiel Mapping (Kurzliste):
- /kursdaten.html -> /kurse/termine
- /einsteiger.html -> /kurse/einsteiger
- /fortgeschrittene.html -> /kurse/fortgeschrittene
- /kursaufbau.html -> /kurse/kursaufbau
- /Privatstunden.html -> /privatunterricht
- /schnupperstunden.html -> /schnupperstunden
- /gutscheine-privatstunden.html -> /gutscheine
- /bilder.html -> /berichte
- /island-2010.html -> /berichte/island-2010
- /Wetter.html -> /wetter (oder entfernen + redirect)

Quellen:
- https://www.fliegenfischer-schule.ch/kursdaten.html
- https://www.fliegenfischer-schule.ch/einsteiger.html
- https://www.fliegenfischer-schule.ch/fortgeschrittene.html
- https://www.fliegenfischer-schule.ch/kursaufbau.html
- https://www.fliegenfischer-schule.ch/Privatstunden.html
- https://www.fliegenfischer-schule.ch/schnupperstunden.html
- https://www.fliegenfischer-schule.ch/gutscheine-privatstunden.html
- https://www.fliegenfischer-schule.ch/island-2010.html
- https://www.fliegenfischer-schule.ch/Wetter.html

## 8) Techstack (an lokale Patterns angelehnt)

- Next.js (App Router) + TypeScript
- Tailwind CSS fuer Designsystem
- Stripe Checkout + Webhooks
- Datenhaltung: MVP statisch (JSON/TS), Phase 2 mit Payload CMS + Postgres
- Deployment: Ubuntu + Nginx, systemd/pm2 oder Docker

## 9) MVP-Umfang (Phase 1)

- Startseite, Kursuebersicht, Kursdetail, Termine
- Buchung + Stripe Zahlung (ohne Admin)
- Gutscheinverkauf (Wertgutschein) + PDF
- Rechtliches + SEO + Redirects

## 10) Phase 2

- Admin UI fuer Kurse/Termine/Bookings
- Content Hub (Berichte/Blog) mit Migration
- Echte Gutscheinverwaltung (Restwert)
- E-Mail Automationen (Reminder)
- Ads/Tracking

## 11) Offene Punkte / Entscheidungen

- Bilder/Branding: Auswahl neuer Fotos (Hero + Kurse)
- CMS Entscheidung (Payload vs Strapi)
- Rechtstexte (AGB/Datenschutz/Impressum) von Kunde freigeben
- Domain/Redirect Mapping finalisieren
