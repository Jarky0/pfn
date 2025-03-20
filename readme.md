# Primitive Formulierungen für Neudenker (PfN) - Modernisierte Version

Eine Progressive Web App für das Wortspiel mit Einsilbiger-Herausforderung. Diese Version wurde mit einer modernen Architektur implementiert und optimiert für mobile Endgeräte.

## Disclaimer

**Dies ist ein inoffizielles Fanprojekt ohne kommerzielle Absicht. Es ist nicht mit Exploding Kittens oder dem Originalspiel "Poesie für Neandertaler" verbunden oder von diesen autorisiert. Dieses Projekt dient ausschließlich zu Lern- und persönlichen Zwecken.**

## Über das Spiel

"Primitive Formulierungen für Neudenker" ist ein interaktives Wortspiel, bei dem Spieler Wörter erklären müssen, ohne das zu erratende Wort zu nennen, und dabei nur einsilbige Wörter verwenden dürfen. Das Spiel ist darauf ausgelegt, in Teams gespielt zu werden, wobei ein Spieler ein Wort erklärt und die anderen Teammitglieder raten müssen.

## Modernisierte Architektur

Diese Version verwendet moderne Web-Entwicklungspraktiken:

- **ES-Module**: Explizite Import-/Export-Beziehungen zwischen Modulen
- **Komponentenbasierter Ansatz**: Wiederverwendbare UI-Komponenten mit eigener Logik und Darstellung
- **Zentrales State-Management**: Strukturierte Zustandsverwaltung über ein Event-basiertes System
- **Verbesserte Service-Worker**: Optimierte Offline-Fähigkeit mit strategischem Caching
- **Responsive Design**: Optimiert für verschiedene Bildschirmgrößen (Smartphone, Tablet, Desktop)

## Projektstruktur

```
pfn/
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
├── styles/                 # CSS-Dateien
│   ├── base.css            # Grundlegende Stile
│   ├── components/         # Komponenten-spezifische Stile
│   ├── pages/              # Seitenspezifische Stile
│   └── utils/              # Hilfsstile (Variablen, Animationen, Media Queries)
├── utils/                  # Hilfsfunktionen
│   └── common.js           # Gemeinsam genutzte Funktionen
├── index.html              # Hauptseite
├── script.js               # Hauptskript (Einstiegspunkt)
├── service-worker.js       # Service Worker für Offline-Funktionalität
├── manifest.json           # PWA-Konfiguration
└── package.json            # Projektabhängigkeiten
```

## Technische Features

### 1. Modulare Komponenten

Jede UI-Komponente ist in einer eigenen Datei definiert und verwaltet ihren eigenen DOM-Abschnitt:

- **ScoreBoard**: Zeigt Teams und Punkte an, visualisiert Punkteänderungen
- **TeamSetup**: Verwaltet die Team-Erstellung mit farblicher Unterscheidung
- **WordDisplay**: Zeigt die aktuelle Wortkarte mit Animation an
- **GameTimer**: Verwaltet den Spieltimer mit visueller Countdown-Darstellung

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

### 5. Spielstatistiken

Die Anwendung bietet umfangreiche Spielstatistiken:
- Detaillierte Teamanalysen (gewonnene Punkte, Erfolgsquote)
- Visualisierung von Worttypen (einfach, zusammengesetzt, übersprungen)
- Übersicht häufig übersprungener Wörter
- Möglichkeit zum Teilen der Statistiken

## Installation und Nutzung

Das Projekt ist als statische Website konzipiert und benötigt keinen Build-Prozess oder externe Abhängigkeiten.

### Installation

1. Repository klonen:
   ```
   git clone https://github.com/Jarky0/pfn.git
   cd pfn
   ```

2. `index.html` in einem modernen Webbrowser öffnen oder auf einem Webserver bereitstellen.

### Entwicklung

Um Änderungen vorzunehmen, kannst du einfach die entsprechenden HTML-, CSS- oder JavaScript-Dateien in einem Code-Editor bearbeiten. Nach dem Speichern der Änderungen lade die index.html im Browser neu, um die Änderungen zu sehen.

### Bereitstellung

Zum Bereitstellen auf einem Webserver kopiere einfach alle Dateien des Projekts in das entsprechende Verzeichnis deines Webservers.

## Spielanleitung

1. **Vorbereitung**:
   - Teams erstellen (2-8 Teams möglich)
   - Rundenzeit festlegen (Standard: 60 Sekunden)
   - Zielpunktzahl für den Sieg festlegen

2. **Spielablauf**:
   - Gerät in der Gruppe herumreichen
   - Auf "Runde starten" tippen, um die Runde zu beginnen
   - Das angezeigte Wort erklären, ohne es selbst zu benutzen
   - Nur einsilbige Wörter für die Erklärung verwenden!

3. **Punktesystem**:
   - Einfaches Wort erraten: +1 Punkt
   - Zusammengesetztes Wort erraten: +3 Punkte
   - Überspringen oder Regelverstoß: -1 Punkt

4. **Spielende**:
   - Das Team, das zuerst die Zielpunktzahl erreicht, gewinnt
   - Alle anderen Teams haben dann noch eine letzte Chance, aufzuholen

## Wortlisten

Die App verwendet standardmäßig die integrierte Wortliste `words_deDE.txt`. Das Format ist:

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

### Eigene Wortlisten

Du kannst eigene Wortlisten im gleichen Format hochladen. Die App bietet die Möglichkeit, die Wahrscheinlichkeit einzustellen, mit der Wörter aus der Standard- oder aus der eigenen Liste gezogen werden.

## Progressive Web App

Die Anwendung ist als PWA konzipiert und bietet:
- Installation auf dem Homescreen
- Offline-Funktionalität
- Schnelle Ladezeiten durch Cache-Optimierung
- Screen Wake Lock auf unterstützten Geräten (verhindert Bildschirm-Timeout während des Spiels)

## Lizenz

Der Code dieses Projekts steht unter der MIT-Lizenz. Weitere Details in der `LICENSE.md`-Datei.

Bitte beachte, dass diese Lizenz nur für die Implementierung gilt und keine Rechte an dem zugrunde liegenden Spielkonzept gewährt, welches von anderem geistigen Eigentum geschützt sein könnte.
