# WYSIWYG Landing‑Page Editor – Konzept

## Ziel
Einen **WYSIWYG‑Editor** im Admin bereitstellen, der die **Landing Page** (Startseite) visuell darstellt und **inline** editierbare Texte bietet. Änderungen sollen **automatisch gespeichert** werden (Autosave) und immer die **aktuelle Landing‑Page Struktur** widerspiegeln.

## Umfang (Scope)
Bearbeitbar (inline, mit Autosave):
- **Hero**: Titel, Beschreibung, Button‑Texte. Links nur durch Super Admin.
- **USP‑Kacheln**: Titel + Beschreibung.
- **Startseiten‑Sektionen** (SectionHeader): Eyebrow, Titel, Beschreibung (Kurse, Privatlektion, Links, Wetter, Kontakt).
- **FAQ‑Quellen (Kursformate)**: Titel, Beschreibung. Links nur durch Super Admin.
- **Lernpfad** (coursePathSteps): Stufe, Titel, Detail.
- **Über‑uns Bereich**: Titel/Intro, Bio, Werte, Highlights sowie CTA‑Texte (Links nur durch Super Admin).
- **FAQ (Kurse)**: Fragen + Antworten (Basis‑FAQs).
- **Testimonials**: Zitat + Autor.
- **CTA‑Block**: Titel, Beschreibung, Notiz, Button‑Texte. Links nur durch Super Admin.
- **Kontakt‑Daten** (contact): Name, Adresse, Telefon, Mobile, E‑Mail.
- **Landing‑Bilder**: Privatlektion‑Illustration und Kontakt‑Illustration.

Nicht editierbar (nur Anzeige):
- **Dynamische Daten**: Kurse/Termine, Buchungen, Wetter, Berichte‑Liste.
- **Funktionen** (Kontakt‑Formular, Wetterlogik, Stripe, etc.).

> Hinweis: Dynamische Inhalte bleiben sichtbar, aber **read‑only**. So bleibt die Seite realistisch, ohne die Datenquelle zu verändern.

## Datenquelle & Synchronisierung
- Alle WYSIWYG‑Änderungen werden in **`siteSettings`** gespeichert.
- Die Landing Page liest bereits aus diesen Feldern → Änderungen erscheinen sofort.
- Speicherung erfolgt pro Feld (Patch‑Update), kein komplettes JSON manuell nötig.

## Bedienung & UX
- **Inline‑Editing** via `contentEditable` (Text direkt anklicken und überschreiben).
- **Autosave** nach kurzer Inaktivität (Debounce ~800ms).
- **Status‑Anzeige** (z. B. „Speichert…“, „Gespeichert“, „Fehler“).
- **Editierfelder visuell markiert** (zarte Outline/Highlight beim Fokus).

## Technischer Ansatz
1) **Sub‑Menu hinzufügen**: `Inhalte → WYSIWYG`.
2) **Neue Seite**: `/admin/inhalte/wysiwyg`.
3) **Editable Components**:
   - `EditableText` für Inline‑Text.
   - `EditableInput` für Links/URLs.
   - Debounce + Autosave via `/api/admin/landing-wysiwyg`.
4) **API**: Patch‑Updates auf `siteSettings` (pro Feld).
5) **Sicherheit**: Admin‑Session erforderlich. Link‑Änderungen sind auf Super Admin beschränkt.

## Risiken / Grenzen
- Änderungen wirken **direkt live** (keine „Draft/Preview“). Optional später ergänzen.
- Neue Elemente (z. B. zusätzliche FAQ‑Punkte) werden **zunächst nicht** im WYSIWYG hinzugefügt, sondern über bestehende Admin‑Formulare. (Kann später erweitert werden.)

## Nächste Schritte
1) Sub‑Menu + Seite anlegen.
2) Inline‑Editor mit Autosave bauen.
3) API‑Patch & Statusfeedback.
4) Deploy + kurzes Review.
