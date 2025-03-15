# Poesie für Neandertaler (PfN)

Eine moderne Web-App-Version des beliebten Wortspiels "Poesie für Neandertaler" (auch bekannt als "Poetry for Neanderthals").

## Beschreibung

Poesie für Neandertaler ist ein unterhaltsames Gruppenspiel, bei dem Spieler Wörter erklären müssen, ohne sie zu verwenden - und dabei dürfen sie nur einsilbige Wörter benutzen! Die App ersetzt das physische Kartenspiel und ermöglicht es, das Spiel überall mit dem Smartphone zu spielen.

## Funktionen

- Einfache, benutzerfreundliche mobile Oberfläche
- Timer mit visueller Anzeige
- Punktesystem für Teams
- Unterstützung für benutzerdefinierte Wortlisten
- Offline-Funktionalität dank PWA-Unterstützung
- Wischgesten für schnellere Spielinteraktionen
- Verhindert das Ausschalten des Bildschirms während des Spiels (Wake Lock API)

## Installation

1. Klone dieses Repository:
   ```
   git clone https://github.com/username/poesie-fuer-neandertaler.git
   ```

2. Öffne die `index.html` Datei in einem modernen Webbrowser oder deploye die Dateien auf einem Webserver.

### PWA Installation

Um die App als Progressive Web App auf deinem Smartphone zu installieren:

1. Öffne die Website im Chrome-Browser (oder einem anderen kompatiblen Browser)
2. Tippe auf das Menü-Symbol und wähle "Zum Startbildschirm hinzufügen"
3. Folge den Anweisungen auf dem Bildschirm

## Dateien im Projekt

- `index.html`: Hauptdatei mit der HTML-Struktur
- `styles.css`: Alle Styling-Regeln
- `word-loader.js`: Verarbeitung der Wortlisten
- `ui-effects.js`: Visuelle Effekte und Animationen
- `game-logic.js`: Hauptspiellogik
- `script.js`: Event-Listener und Initialisierung
- `service-worker.js`: Offline-Funktionalität
- `manifest.json`: PWA-Konfiguration

## Wortlisten

Die App verwendet Wortlisten im Format:
```
Zusammengesetztes Wort; Einfaches Wort
```

Ein Beispiel:
```
Zwiebelsuppe; Suppe
Zwillingsbruder; Bruder
```

Die Standardwortliste `words_deDE.txt` ist nicht im Repository enthalten, kann aber im Spiel hochgeladen werden.

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

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE`-Datei für Details.

## Hinweise zur Entwicklung

Diese Web-App wurde mit modernen Webtechnologien entwickelt:
- HTML5 für die Struktur
- CSS3 für das Styling und Animationen
- Vanilla JavaScript für die Funktionalität
- Service Workers für Offline-Unterstützung
- Web App Manifest für PWA-Funktionalität

## Kontakt

Bei Fragen oder Anregungen, erstelle bitte ein Issue im GitHub-Repository.