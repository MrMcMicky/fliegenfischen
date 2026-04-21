# Standortbestimmung im Fliegenwerfen

## Ziel

Die Standortbestimmung soll Interessierten vor dem ersten Kontakt helfen, ihr aktuelles Niveau im Fliegenwerfen einzuordnen. Das Ergebnis ist keine Zertifizierung, sondern eine praxisnahe Orientierung: Wo stehe ich aktuell, welche Themen bremsen mich und welcher Unterrichtsaufwand ist sinnvoll?

## Fachliche Grundlage

Die Logik orientiert sich an etablierten Casting-Schwerpunkten aus internationalen Ausbildungs- und Skills-Programmen, insbesondere Fly Fishers International Casting Skills Development. Relevante Kompetenzfelder sind:

- Ruten- und Schnurkontrolle: kontrollierte Schlaufen, gestrecktes Vorfach, Timing, Stopp und Drift.
- Grundwürfe: Überkopfwurf, Rollwurf, Pick-up & Lay-down, Richtungswechsel.
- Genauigkeit: wiederholbare Präsentation auf kurze und mittlere Distanzen.
- Distanz: kontrollierte Würfe jenseits der Komfortzone, ohne die Form komplett zu verlieren.
- Präsentation: leises Ablegen, Mending, situationsgerechte Schnurführung.
- Praxistransfer: Wind, beengte Ufer, Strömung, Zielfischerei und Fehlerkorrektur.

Quellen und Referenzpunkte:

- Fly Fishers International, Fly Casting Skills Development: https://www.flyfishersinternational.org/Fly-Casting-Education/Casting-Education/Fly-Casting-Skills-Development
- Fly Fishers International, FCSD Angler Guide PDF: https://www.flyfishersinternational.org/Portals/0/LearningCenter/FCSD/FFI_FCSD_Program_Angler_Guide.pdf
- Fly Fishers International, Casting Instructor Certification: https://www.flyfishersinternational.org/Fly-Casting-Education/Become-a-Certified-Instructor
- European Fly Fishing Association, Fly casting und Certification: https://effa.info/welcome.html

## Positionierung auf der Website

Arbeitstitel: **Standortbestimmung im Fliegenwerfen**

Kurzlabel für Buttons: **Wurfstand testen**

Hero-CTA:

- Primär: „Wurfstand testen“ -> `/#standortbestimmung`
- Sekundär: „Standortbestimmung anfragen“ -> `/#standortbestimmung`

Die Sektion steht direkt nach den USP-Karten, vor Gutscheinen und Kursen. Dadurch wird der neue Einstieg sichtbar, ohne bestehende Buchungswege zu verdrängen.

## Frage-Logik

Der Self-Test ist bewusst kurz gehalten. Er fragt nicht nach perfekter Fachsprache, sondern nach beobachtbarem Können. Jede Antwort hat Punkte. Daraus ergeben sich vier Orientierungsstufen.

### Fragen

1. **Wie oft hast du bisher mit der Fliegenrute geworfen?**
   - Noch nie oder nur sehr kurz: 0
   - Einige Male, aber ohne Routine: 1
   - Regelmässig in Kursen oder am Wasser: 2
   - Seit mehreren Saisons bewusst trainiert: 3

2. **Wie sicher ist dein Überkopfwurf auf 8-12 Meter?**
   - Noch unsicher oder nicht bekannt: 0
   - Schnur liegt oft unruhig oder fällt zusammen: 1
   - Meist kontrolliert, aber nicht immer gestreckt: 2
   - Wiederholbar mit gestrecktem Vorfach: 3

3. **Wie gut funktioniert dein Rollwurf?**
   - Noch nicht geübt: 0
   - Geht nur gelegentlich: 1
   - Funktioniert auf kurze Distanz: 2
   - Kontrolliert mit sauberem D-Loop und Zielrichtung: 3

4. **Wie genau triffst du Ziele auf 8-12 Meter?**
   - Zufällig oder selten: 0
   - Ungefähr in die Richtung: 1
   - Mehrere Würfe landen in der Nähe: 2
   - Wiederholbar in einem engen Zielbereich: 3

5. **Wie gehst du mit Wind oder beengtem Ufer um?**
   - Ich breche meist ab: 0
   - Ich versuche es, verliere aber Kontrolle: 1
   - Ich kenne einzelne Anpassungen: 2
   - Ich kann Wurfebene, Winkel oder Technik bewusst anpassen: 3

6. **Kannst du typische Fehler selbst erkennen?**
   - Nein, ich merke nur dass es nicht klappt: 0
   - Teilweise, aber ohne klare Korrektur: 1
   - Ich erkenne Timing-/Schlaufenprobleme oft: 2
   - Ich kann Ursache und Korrektur meist benennen: 3

7. **Was ist aktuell dein Hauptziel?**
   - Grundlagen sauber lernen: 0
   - Mehr Kontrolle und weniger Kraftaufwand: 1
   - Genauigkeit, Präsentation und Praxis verbessern: 2
   - Feinschliff, Distanz, Spezialwürfe oder Prüfungsvorbereitung: 3

8. **Wie schnell möchtest du Fortschritt sehen?**
   - Erst einmal unverbindlich einschätzen: 0
   - In den nächsten Wochen gezielt üben: 1
   - Ich möchte einen klaren Trainingsplan: 2
   - Ich will intensiv und mit direktem Feedback arbeiten: 3

### Auswertung

- 0-6 Punkte: **Grundlagen aufbauen**
  Empfehlung: Einsteigerkurs oder Schnupperstunde. Fokus auf Sicherheit, Material, Grundwurf und erste kontrollierte Präsentation.

- 7-13 Punkte: **Kontrolle stabilisieren**
  Empfehlung: Standortbestimmung oder Privatlektion mit Video-/Direktfeedback. Fokus auf Timing, Schlaufenbild, Rollwurf und Genauigkeit.

- 14-19 Punkte: **Praxis gezielt verbessern**
  Empfehlung: 2-3 Stunden Privatlektion oder Kleingruppen-Coaching. Fokus auf Präsentation, Wind, Mending, wechselnde Distanzen und Gewässersituationen.

- 20-24 Punkte: **Feinschliff & Spezialthemen**
  Empfehlung: individuelles Coaching. Fokus auf Diagnostik, Spezialwürfe, Distanzkontrolle, Prüfungs-/Instruktorvorbereitung oder konkrete Fischerei-Situationen.

## Datenspeicherung

Für jede abgeschlossene Standortbestimmung wird ein Datensatz gespeichert:

- Kontakt: Name, E-Mail, Telefon optional.
- Ergebnis: Punkte, Stufe, Titel und Empfehlung.
- Antworten: vollständige Frage-/Antwortstruktur als JSON.
- Status: `OPEN`, `DONE`, `ARCHIVED`.
- Notizfeld für Admin.

Admin-Sicht:

- Neuer Unterpunkt unter „Anfragen“: **Standortbestimmung**
- Liste mit Datum, Name, E-Mail, Score, Stufe und Status.
- Detailansicht/Drawer mit Antworten, Empfehlung und Kontaktlinks.
- Statusänderung direkt speicherbar.

## UX

Frontend-Ablauf:

- Kompakte Einleitung: „In 2 Minuten einschätzen, wo du stehst.“
- Schrittweise Fragen mit Fortschrittsanzeige.
- Ergebnis sofort anzeigen.
- Kontaktfelder am Ende, damit die Einschätzung gespeichert und für ein Beratungsgespräch vorbereitet ist.
- Kein Login, keine Zahlungsstrecke.

Ton:

- Klar, fachlich, motivierend aber nicht werblich.
- Ergebnis als nächste sinnvolle Lernrichtung, nicht als Bewertung der Person.
