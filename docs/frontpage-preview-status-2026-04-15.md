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
- Im aktuellen Git-Stand und in den lokalen Reflog-/Stash-Objekten existiert
  keine separate alte `app/test`-Frontpage-Implementierung.
- Die Preview-Route wurde daher als noindex-Wrapper der aktuellen Frontpage
  wiederhergestellt: `app/test/page.tsx`.
- `proxy.ts` rewritet Requests an `test.fliegenfischer-schule.shop/` intern auf
  `/test`.
- Der alte Admin-Header-Proxy bleibt unverändert erhalten.

## Design-Analyse

Das derzeit verfügbare Frontpage-Design ist die aktuelle One-Page-Startseite.
Sie enthält bereits die relevanten Ankerbereiche:

- `#gutscheine`
- `#kurse`
- `#faq`
- `#privat`
- `#ueber`
- `#links`
- `#wetter`
- `#kontakt`

Die Seite ist funktional weit ausgebaut: Hero, USP-Karten, Gutscheine,
Kurstermine, FAQ, Testimonials, Privatlektion, Über-uns, Links/Berichte,
Wetter und Kontaktformular sind verbunden. Der alternative frühere
Standalone-Stand ist im Repository nicht mehr als eigenständiges Design
rekonstruierbar.

## Externer Blocker

Der Cloudflare-DNS-Eintrag für `test.fliegenfischer-schule.shop` kann mit den
lokal vorhandenen Cloudflare-Zugangsdaten nicht korrekt in der Zone
`fliegenfischer-schule.shop` angelegt werden. Der lokale `cloudflared`-Login ist
auf eine andere Zone ausgerichtet.

In Cloudflare muss in der korrekten Zone noch ein Hostname auf denselben Tunnel
wie `fliegenfischer-schule.shop` geroutet werden:

- Hostname: `test.fliegenfischer-schule.shop`
- Ziel: derselbe Cloudflare Tunnel wie die Hauptdomain

Danach sollte die Subdomain automatisch die App-seitige `/test`-Preview
ausliefern.
