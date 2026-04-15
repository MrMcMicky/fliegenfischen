# Frontpage Preview Status - 2026-04-15

## Ziel

Eine eigene Preview-Subdomain soll die bisherige Frontpage-Testadresse ersetzen,
damit Links und Hash-Anker direkt unter einer sauberen Host-Adresse funktionieren.

Vorgesehene Adresse:

- `https://test.fliegenfischer-schule.shop/`
- Beispiel-Anker: `https://test.fliegenfischer-schule.shop/#kurse`

## Technischer Stand

- Die Live-Route `https://fliegenfischer-schule.shop/test` liefert vor diesem
  Stand 404.
- Im aktuellen Git-Stand und in den lokalen Reflog-/Stash-Objekten existierte
  keine separate alte `app/test`-Frontpage-Implementierung.
- Der frühere Teststand vom 2026-04-08 wurde aus der lokalen Codex-Session-
  Historie und dem Screenshot `output/screenshots/live-test-after-reload.png`
  rekonstruiert.
- Die Preview-Route ist eine noindex-Variante der aktuellen Frontpage:
  `app/test/page.tsx`.
- Abweichung zur Live-Startseite: Die Hero-Section verwendet auf der Preview
  das alte Foto `public/illustrations/landing/mann-fliegenfischen.png`, eine
  andere Hero-Typografie, andere Positionierung und die Legacy-Logo-/Header-
  Behandlung.
- `proxy.ts` rewritet Requests an `test.fliegenfischer-schule.shop/` intern auf
  `/test`.
- Der alte Admin-Header-Proxy bleibt unverändert erhalten.

## Design-Analyse

Das Preview-Design nutzt dieselben funktionalen Inhaltsbereiche wie die
aktuelle One-Page-Startseite, aber mit der wiederhergestellten Legacy-Hero-
Gestaltung. Die relevanten Ankerbereiche bleiben erhalten:

- `#gutscheine`
- `#kurse`
- `#faq`
- `#privat`
- `#ueber`
- `#links`
- `#wetter`
- `#kontakt`

Die Seite ist funktional verbunden: Hero, USP-Karten, Gutscheine, Kurstermine,
FAQ, Testimonials, Privatlektion, Über-uns, Links/Berichte, Wetter und
Kontaktformular. Der alternative Stand war nicht als Git-Commit gesichert; die
wiederhergestellte Variante ist deshalb jetzt explizit über `heroVariant="legacy"`
angebunden und versioniert.

## DNS-Status

Der Cloudflare-DNS-Eintrag für `test.fliegenfischer-schule.shop` wurde am
2026-04-15 in der Zone `fliegenfischer-schule.shop` angelegt.

- Typ: `CNAME`
- Name: `test`
- Ziel: `4e1ac6f2-95fe-45e4-96bb-c903f64c9f40.cfargotunnel.com`
- Proxy: aktiviert

Verifizierte URLs:

- `https://test.fliegenfischer-schule.shop/`
- `https://fliegenfischer-schule.shop/test`

Hinweis: Ein vorheriger lokaler `cloudflared`-Aufruf hat in einer anderen Zone
den falschen Record `test.fliegenfischer-schule.shop.assistent.my.id` angelegt.
Der lokal vorhandene API-Token kann diese Zone nicht bereinigen; der Record ist
für die Preview-Subdomain nicht relevant, sollte aber in der Zone
`assistent.my.id` entfernt werden, falls dort sichtbar.
