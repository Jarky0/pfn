# Primitive Formulierungen für Neudenker (PfN)

Eine mobile Web-App für das Wortspiel mit Einsilbiger-Herausforderung.

## Disclaimer

**Dies ist ein inoffizielles Fanprojekt ohne kommerzielle Absicht. Es ist nicht mit Exploding Kittens oder dem Originalspiel "Poesie für Neandertaler" verbunden oder von diesen autorisiert. Dieses Projekt dient ausschließlich zu Lern- und persönlichen Zwecken.**

## Beschreibung

Primitive Formulierungen für Neudenker ist ein unterhaltsames Gruppenspiel, bei dem Spieler Wörter erklären müssen - und dabei nur einsilbige Wörter verwenden dürfen!

## Funktionen

- Einfache, benutzerfreundliche mobile Oberfläche
- Timer mit visueller Anzeige
- Punktesystem für Teams
- Unterstützung für benutzerdefinierte Wortlisten
- Offline-Funktionalität dank PWA-Unterstützung
- Verhindert das Ausschalten des Bildschirms während des Spiels

## Installation

1. Repository klonen:

   ```
   git clone https://github.com/Jarky0/pfn.git
   ```

2. `index.html` in einem modernen Webbrowser öffnen oder auf einem Webserver bereitstellen.

## Spielregeln

1. Teams erstellen und Rundenzeit festlegen
2. Handy in der Gruppe herumreichen
3. Das angezeigte Wort erklären, ohne es zu benutzen
4. Nur einsilbige Wörter verwenden!
5. Punktesystem:
   - Einfache Wörter: 1 Punkt
   - Zusammengesetzte Wörter: 3 Punkte
   - Überspringen oder Verstoß: -1 Punkt
6. Das Team mit den meisten Punkten gewinnt

## Wortlisten

Die App verwendet die Standardwortliste `words_deDE.txt` im Repository. Das Format ist:

```
Zusammengesetztes Wort; Einfaches Wort
```

Beispiele:

```
Zwiebelsuppe; Suppe
Zwillingsbruder; Bruder
Hausboot; Boot
Spielfeld; Feld
```

### Hinweise zur Wortliste

- Jede Zeile enthält ein Wortpaar
- Getrennt durch Semikolon
- Zusammengesetztes Wort zuerst, einfaches Wort danach
- Eigene Wortlisten können in der App hochgeladen werden

## Projektstruktur

- `index.html`: Hauptdatei mit der HTML-Struktur
- `styles.css`: Alle Styling-Regeln
- `word-loader.js`: Verarbeitung der Wortlisten
- `ui-effects.js`: Visuelle Effekte und Animationen
- `game-logic.js`: Hauptspiellogik
- `script.js`: Event-Listener und Initialisierung
- `service-worker.js`: Offline-Funktionalität
- `manifest.json`: PWA-Konfiguration
- `words_deDE.txt`: Standard-Wortliste

## Technologien

Diese Web-App wurde mit modernen Webtechnologien entwickelt:

- HTML5 für die Struktur
- CSS3 für das Styling und Animationen
- Vanilla JavaScript für die Funktionalität
- Service Workers für Offline-Unterstützung
- Web App Manifest für PWA-Funktionalität

## Lizenz

Der von mir geschriebene Code dieses Projekts steht unter der MIT-Lizenz. Weitere Details in der `LICENSE.md`-Datei.

Bitte beachte, dass diese Lizenz nur für die Implementierung gilt und keine Rechte an dem zugrunde liegenden Spielkonzept gewährt, welches von anderem geistigen Eigentum geschützt sein könnte.

## Nur für persönliche Nutzung

Dieses Projekt wurde für persönliche und Lernzwecke erstellt. Es ist nicht für kommerzielle Nutzung oder öffentliche Verbreitung gedacht.

## Kontakt

Bei Fragen oder Anregungen ein Issue im GitHub-Repository erstellen.
