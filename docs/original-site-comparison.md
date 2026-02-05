# Vergleich Originalseite vs. neue Seite (fehlende Elemente + Umsetzungsvorschlag)

## Quelle (Originalseite)
- Startseite: https://www.fliegenfischer-schule.ch/home.html
- Kursangebote: https://www.fliegenfischer-schule.ch/kurse.html
- Bilder & Berichte: https://www.fliegenfischer-schule.ch/bilder.html
- Links: https://www.fliegenfischer-schule.ch/links.html
- SFV: https://www.fliegenfischer-schule.ch/sfv.html
- Wetter: https://www.fliegenfischer-schule.ch/Wetter.html
- Aktuelles: https://www.fliegenfischer-schule.ch/aktuelles.html

## Original-Informationen (Kurzliste)
### Navigation / Inhalte
- Startseite
- Ueber mich
- Kursangebote
- Bilder und Berichte
- Links
- SFV
- Wetter in der Schweiz
- Aktuelles

### Kursangebote (Unterpunkte)
- Kursdaten/Preise
- Einsteiger und leicht Fortgeschrittene
- Fortgeschrittene
- Geschenk-Gutscheine
- Schnupperstunden
- Privatstunden
- Kursaufbau
- Kursanmeldung

### Bilder & Berichte (Beispiele)
- Island 2010 - Haukadalsa
- Murgsee
- Der laengste Fischpass Europas (Wettingen)

### Links (Kategorien + Beispiele)
- Vereine/Clubs
  - FV Wurenlos: https://www.fvwuerenlos.ch
  - FVZ 1883 Zuerich: https://www.fvz1883.ch
  - Flyfishing Club Zuerich: https://www.zueriflyfishing.ch
- Gewaesser
  - Nagold: https://www.nagoldfliegenfischer.de
- Ausruestung/Fliegenbinden
  - Swiss CDC: https://www.swisscdc.com
  - Swissflies: https://www.swissflies.ch
  - FunFish: https://www.funfish.ch
  - Nymphen: https://www.nymphen.ch

### Wetter
- Verweis auf SF Meteo: https://www.meteo.sf.tv

### SFV
- Verweis auf SFV + Instruktorenkurse

### Aktuelles
- Bild-Thumbnail Galerie

## Status in der neuen Seite (Stand heute)
### Bereits vorhanden
- Berichte existieren als Sektion (sollten die drei klassischen Berichte explizit enthalten).
- Kursangebote im Sinne der Hauptkategorien sind vorhanden.
- Privatlektion ist vorhanden.

### Fehlt oder nur teilweise abgedeckt
1) Links (eigene Sektion)
2) SFV (Verweis + Instruktorenkurse)
3) Wetter (Verweis/Widget)
4) Aktuelles (Bild-/News-Galerie)
5) Kursangebote-Unterseiten sichtbar machen (Kursdaten/Preise, Kursaufbau, Kursanmeldung etc.)
6) Wurfkurse 2026 Online (kleiner CTA-Link)

## Vorschlag fuer die Implementierung (kompakt & UX-freundlich)
### 1) Links-Sektion (neuer Abschnitt auf der Startseite)
- Drei Spalten/Cluster:
  - Vereine & Clubs
  - Gewaesser
  - Ausruestung/Fliegenbinden
- Optional: kleine Logo-Badges

### 2) SFV-Mini-Block
- Kurzer Infotext + Link zu SFV
- Hinweis auf Instruktorenkurse
- Platzierung: Footer-Bereich oder unter Kontakt

### 3) Wetter-Block
- Kleine Kachel mit Link zu SF Meteo
- Optional: Icon + kurzer Satz

### 4) Aktuelles
- Schmale Bildleiste (3-5 Thumbnails)
- Option A: eigenes Content-Modell
- Option B: reuse Berichte mit Flag "Aktuell"

### 5) Bilder & Berichte
- Sicherstellen, dass die drei klassischen Berichte vorhanden sind
- In der Berichte-Sektion prominent anzeigen

### 6) Kursangebote-Struktur sichtbar machen
- Kleine Link-Liste oder Pills unter der Kurssektion:
  - Kursdaten/Preise
  - Einsteiger
  - Fortgeschrittene
  - Schnupperstunden
  - Privatstunden
  - Kursaufbau
  - Kursanmeldung

### 7) Wurfkurse 2026 Online
- Kleine CTA-Zeile im Hero oder in der Kurssektion

## Empfohlene Reihenfolge
1) Links, SFV, Wetter (kleine, klare Sektionen)
2) Aktuelles (Galerie)
3) Kursangebote-Links + Wurfkurse-CTA
4) Berichte finalisieren
