# Admin & Stripe Konzept - Fliegenfischerschule

Stand: 2026-01-31

## Ziele
- Admin-Backend fuer alle Inhalte und Angebote (Kurse, Termine, Gutscheine, Privat/Schnupper, Berichte, Site-Content).
- Online-Zahlung per Stripe (TWINT + Card) fuer alle buchbaren Produkte.
- Alternative: Rechnung/Vorauszahlung anfragen.
- Klarer Audit-Trail fuer Buchungen/Zahlungen.

## Tech-Entscheide
- **Postgres + Prisma** (wie taize/maxsfloors-shop).
- **Admin-Auth via Session Cookie** (hash, expiry), Rollen: `SUPER_ADMIN`, `ADMIN`.
- **Stripe Checkout** + Webhook (inkl. Event-Dedupe).
- **Server Actions / API Routes** im Next.js App Router.

## Admin-Module ("Alles")
1) **Dashboard**
   - KPIs: naechste Termine, offene Buchungen (Rechnung), bezahlte Buchungen, Voucher offen.
2) **Kurse**
   - Kurs-Typen (Einhand, Zweihand, etc.) bearbeiten.
3) **Termine**
   - Sessions anlegen (Datum, Uhrzeit, Plaetze, Status, Preis, Ort).
4) **Angebote**
   - Privatunterricht & Schnupperstunden (Preis/Stunden/Regeln).
5) **Gutscheine**
   - Voucher-Optionen (Wert/Kurs) + Wertepfade.
   - Voucher-Instanzen (Code, Restwert, Status, Kunde).
6) **Buchungen**
   - Kursbuchungen & Privat/Schnupper-Requests.
   - Statuswechsel (Invoice angefragt / bezahlt / storniert).
7) **Zahlungen**
   - Stripe Sessions/Intents, Status, Timestamp.
8) **Berichte**
   - Report-Artikel (Slug, Titel, Summary, Highlights, Body).
9) **Site Settings**
   - Kontakt, Hero, About, FAQ, CTA-Box, Footer-Links, etc.
10) **Admin Users** (nur SUPER_ADMIN)
   - User verwalten, Rollen, Reset.

## Datenmodell (Vorschlag)

### Auth
- `AdminUser`
  - id, email, name, passwordHash, role, isActive, createdAt, updatedAt
- `AdminSession`
  - tokenHash, adminUserId, expiresAt

### Content
- `Course`
  - id, slug, title, level, category, summary, description,
    imageSrc, imageAlt, highlights[], duration, priceCHF, maxParticipants,
    location, equipment[], includes[], prerequisites[]
- `CourseSession`
  - id, courseId, date, startTime, endTime, location, priceCHF,
    availableSpots, status, notes[]
- `LessonOffering` (Privat/Schnupper)
  - id, type (PRIVATE/TASTER), title, description, priceCHF, minHours,
    additionalPersonCHF, bullets[]
- `VoucherOption`
  - id, title, description, kind (VALUE/COURSE), values[]
- `Report`
  - id, slug, title, location, year, summary, highlights[], body
- `SiteSettings`
  - id=1, name, tagline, location, contact (json), hero (json),
    about (json), sections (json), faqs (json), footer (json)

### Commerce
- `Booking`
  - id, type (COURSE/PRIVATE/TASTER/VOUCHER),
    courseSessionId?, lessonType?, voucherOptionId?,
    customerName, customerEmail, customerPhone?,
    quantity?, hours?, amountCHF, currency,
    paymentMode (STRIPE/INVOICE), status (PENDING/PAYMENT_PENDING/PAID/INVOICE_REQUESTED/CANCELLED),
    notes?, createdAt
- `Payment`
  - id, bookingId, status (PENDING/PAID/FAILED),
    stripeCheckoutSessionId?, stripePaymentIntentId?, paidAt?
- `Voucher`
  - id, code, originalAmount, remainingAmount, status (ACTIVE/REDEEMED/EXPIRED),
    bookingId?, recipientName?, message?, createdAt
- `StripeEvent`
  - id, type, createdAt

## Stripe Flow
- **Checkout** `/api/stripe/checkout`
  - erstellt Session (TWINT + Card), metadata mit bookingId/type
  - speichert `Payment` (PENDING) + booking status `PAYMENT_PENDING`
- **Webhook** `/api/stripe/webhook`
  - Event-Dedupe via `StripeEvent`
  - bei `checkout.session.completed` -> Booking `PAID`, Payment `PAID`, Voucher erzeugen
- **Success/Cancel**
  - `/checkout/erfolg` zeigt Zusammenfassung + ggf. Voucher-Code
  - `/checkout/cancel` zeigt Abbruch

## Invoice/Vorauszahlung
- Checkout-Form erlaubt **"Rechnung anfragen"** via `/api/checkout`.
- Booking wird mit Status `INVOICE_REQUESTED` gespeichert.
- Admin kann Status manuell auf `PAID` setzen.

## Migrationsplan
1) Prisma Schema + Migration + Seed (Admin User).
2) Daten aus `lib/*` in DB (Initial Seed).
3) App-Seiten refactor: Daten aus DB statt statisch.
4) Admin UI + CRUD + Auth.
5) Stripe Integration + Booking UI.

## ENV Variablen
- `DATABASE_URL`
- `ADMIN_COOKIE_SECRET`
- `SESSION_MAX_AGE_DAYS`
- `APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- optional SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`
