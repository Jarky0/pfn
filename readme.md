# Primitive Formulierungen für Neudenker (PfN) - Modernisierte Version

Eine Progressive Web App für das Wortspiel mit Einsilbiger-Herausforderung. Diese Version wurde mit einer modernen Architektur implementiert.

## Disclaimer

**Dies ist ein inoffizielles Fanprojekt ohne kommerzielle Absicht. Es ist nicht mit Exploding Kittens oder dem Originalspiel "Poesie für Neandertaler" verbunden oder von diesen autorisiert. Dieses Projekt dient ausschließlich zu Lern- und persönlichen Zwecken.**

## Modernisierte Architektur

Diese Version verwendet moderne Web-Entwicklungspraktiken:

- **ES-Module**: Explizite Import-/Export-Beziehungen zwischen Modulen
- **Komponentenbasierter Ansatz**: Wiederverwendbare UI-Komponenten
- **Zentrales State-Management**: Strukturierte Zustandsverwaltung
- **Vite als Build-Tool**: Für Optimierungen und schnelles Entwickeln
- **Verbesserte Service-Worker**: Optimierte Offline-Fähigkeit

## Projektstruktur

```
primitive-formulierungen-fuer-neudenker/
├── components/             # UI-Komponenten
│   ├── ScoreBoard.js       # Punkteanzeige-Komponente
│   ├── TeamSetup.js        # Team-Setup-Komponente
│   ├── WordDisplay.js      # Wortanzeige-Komponente
│   └── GameTimer.js        # Timer-Komponente
├── modules/                # Hauptmodule
│   ├── WordLoader.js       # Wortlisten-Verwaltung
│   ├── UIEffects.js        # UI-Effekte und Animationen
│   ├── GameController.js   # Spielsteuerung
│   └── GameStatistics.js   # Statistik-Funktionen
├── state/                  # Zustandsverwaltung
│   └── GameState.js        # Zentraler Spielzustand
├── utils/                  # Hilfsfunktionen
│   └── common.js           # Gemeinsam genutzte Funktionen
├── index.html              # Hauptseite
├── script.js               # Hauptskript (Einstiegspunkt)
├── styles.css              # Hauptstilregeln
├── game-statistics-styles.css # Zusätzliche Stilregeln für Statistik
├── service-worker.js       # Service Worker für Offline-Funktionalität
├── manifest.json           # PWA-Konfiguration
├── vite.config.js          # Vite-Konfiguration
└── package.json            # Projektabhängigkeiten
```

## Verbesserte Architektur

### 1. Modulare Komponenten

Jede UI-Komponente ist in einer eigenen Datei definiert und verwaltet ihren eigenen DOM-Abschnitt:

- **ScoreBoard**: Zeigt Teams und Punkte an
- **TeamSetup**: Verwaltet die Team-Erstellung
- **WordDisplay**: Zeigt die aktuelle Wortkarte an
- **GameTimer**: Verwaltet den Spieltimer mit visueller Darstellung

### 2. Zentrales State-Management

Die `GameState`-Klasse dient als zentrale Quelle für den Spielzustand und verwendet ein Event-basiertes System, um Komponenten zu benachrichtigen.

```javascript
// Beispiel Event-Subscriptions
gameState.subscribe('scoreChange', data => {
  // UI aktualisieren, wenn sich Punkte ändern
});

gameState.subscribe('roundStart', data => {
  // Aktionen bei Rundenstart ausführen
});
```

### 3. Explizite Abhängigkeitsverwaltung

Module importieren ihre Abhängigkeiten explizit:

```javascript
// Explizite Imports
import { GameState } from '../state/GameState.js';
import { ScoreBoard } from '../components/ScoreBoard.js';
import { GameTimer } from '../components/GameTimer.js';
```

### 4. Service Worker Optimierung

Verbesserte Offline-Strategie mit verschiedenen Caching-Strategien je nach Ressourcentyp:

- **HTML**: Network-first mit Cache-Fallback
- **Wortlisten**: Stale-while-revalidate
- **Statische Assets**: Cache-first mit Background-Updates

## Installation und Nutzung

Das Projekt ist als statische Website konzipiert und benötigt keinen Build-Prozess.

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

## Migration von der ursprünglichen Version

Die wichtigsten Änderungen gegenüber der ursprünglichen Version:

1. **Von globalen Objekten zu ES-Modulen**: Keine `window`-Zuweisungen mehr
2. **Von direkter DOM-Manipulation zu Komponenten**: UI-Teile in Komponenten gekapselt
3. **Von impliziter zu expliziter Kommunikation**: Event-basierte Kommunikation
4. **Von manueller zu Build-Tool-optimierter Entwicklung**: Verwendung von Vite

## Lizenz

Der Code dieses Projekts steht unter der MIT-Lizenz. Weitere Details in der `LICENSE.md`-Datei.

Bitte beachte, dass diese Lizenz nur für die Implementierung gilt und keine Rechte an dem zugrunde liegenden Spielkonzept gewährt, welches von anderem geistigen Eigentum geschützt sein könnte.
