# Comic-Gen PWA

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/qnbs/Comic-Gen-PWA)

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Gemini API](https://img.shields.io/badge/Gemini_API-2.5_Pro_|_Imagen_4_|_Veo-4285F4?style=for-the-badge&logo=google)
![D3.js](https://img.shields.io/badge/D3.js-Layouts_&_Physics-F9A03C?style=for-the-badge&logo=d3.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Installable_&_Offline-8A2BE2?style=for-the-badge)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-E65100?style=for-the-badge)

A professional-grade Progressive Web App that functions as a complete studio for transforming literary text into vibrant, multi-page comic books using a sophisticated hybrid AI-algorithmic engine.

---

## English

### 🌟 About The Project

Comic-Gen PWA is a state-of-the-art creative studio that reimagines narrative storytelling. It provides a professional, project-based workflow to convert any text—from classic novels to original scripts—into a complete, visually consistent comic book. This application moves far beyond simple image generation by placing the user in the "director's chair," offering deep creative control over every stage of the production pipeline.

Designed as an installable, offline-capable Progressive Web App, it ensures a seamless, high-performance experience on any device, with all project data stored securely and privately on the client-side using a robust IndexedDB architecture.

### 🧠 Core Philosophy: The Hybrid AI-Algorithmic Engine

The power of this application lies in its **hybrid engine**, an advanced architecture that intelligently delegates tasks to the systems best suited for them. This solves the fundamental challenges of generative AI—unpredictability and lack of structure—by creating a synergistic partnership between creative AI and logical algorithms.

-   **🤖 AI for Creativity & Interpretation (The "Artist")**: The Google Gemini API suite handles the nuanced, creative, and semantic tasks. It acts as the project's digital artist, writer's room, and foley artist. This includes analyzing narrative structure, understanding scene context, generating evocative visual prompts, and creating the actual artwork, video loops, and text-to-speech dialogue. It excels at tasks requiring a grasp of language, artistic expression, and complex interpretation.
    -   **Text Analysis:** `gemini-2.5-pro`
    -   **Image Generation:** `imagen-4.0-generate-001`
    -   **Video Generation:** `veo-3.1-fast-generate-preview`
    -   **Text-to-Speech:** `gemini-2.5-flash-preview-tts`

-   **📐 Algorithms for Structure & Precision (The "Technician")**: Deterministic algorithms, powered by the D3.js library, manage tasks that demand mathematical precision and unwavering structure. This layer acts as the project's layout artist and physics engine. It is responsible for calculating balanced, professional panel layouts based on scene importance (`d3-hierarchy`) and running real-time physics simulations to place speech bubbles in aesthetically pleasing, collision-free positions (`d3-force` in a Web Worker).

This strategic separation of concerns allows for a final product that is both creatively rich and professionally composed, harnessing the imaginative power of AI while grounding it in the reliable, structured world of classical computing.

### ✨ Feature Matrix

| Category                             | Feature                                                                                                | Technology Stack                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 📂 **Project Lifecycle Management**  | Professional project-based workflow for entire books with multi-chapter support.                       | Redux Toolkit, IndexedDB                                                        |
|                                      | Persistent, high-performance local storage for all project data and media blobs.                       | `idb` library, PWA Service Worker                                               |
|                                      | Full comic library with debounced search, sorting, and multi-select/bulk-delete capabilities.          | React, Reselect                                                                 |
|                                      | Full project import/export, bundling all data and media into a single `.json` file.                      | JSZip, File API                                                                 |
| 🤖 **AI-Powered Narrative Deconstruction** | **Unified Search** across Gutenberg, OpenLibrary, Wikimedia & DTA; also `.txt` upload & paste text. | `Promise.allSettled`, Custom Service Layer                                      |
|                                      | Global text analysis to automatically structure manuscripts into chapters.                             | `gemini-2.5-pro`                                                                |
|                                      | Scene segmentation with JSON output for precise narrative unit breakdown.                              | `gemini-2.5-pro`                                                                |
|                                      | In-depth scene analysis for summaries, characters, dialogue, and AI-generated visual prompts.          | `gemini-2.5-pro`                                                                |
|                                      | **Advanced DTA Integration:** Parses TEI/XML for high-quality text extraction.                           | `DOMParser`                                                                     |
| 🎨 **World-Building & Visual Canon** | **Character Sheets**: Generate canonical reference images and descriptions for visual consistency.     | `imagen-4.0-generate-001`                                                       |
|                                      | **Location & Prop Sheets**: Create concept art for key settings and items.                             | `imagen-4.0-generate-001`                                                       |
|                                      | **Pose & Expression Library**: Build a character-specific library of dynamic poses to guide the AI.      | `imagen-4.0-generate-001`                                                       |
| 🎬 **Dynamic Media Generation**     | **High-Quality Panel Art**: Generate images with support for multiple art styles and negative prompts. | `imagen-4.0-generate-001`                                                       |
|                                      | **Video Panel Generation**: Convert any static panel into a short, cinematic video loop.               | `veo-3.1-fast-generate-preview`                                                 |
|                                      | **Text-to-Speech Dialogue**: Generate and play back spoken dialogue with selectable voices.              | `gemini-2.5-flash-preview-tts`                                                  |
| 🖌️ **Post-Production & Refinement**  | **Interactive Comic Viewer**: A storyboard view of all pages with drag-and-drop reordering.            | React                                                                           |
|                                      | **In-Situ Panel Regeneration**: Click any panel to regenerate its image with a modified prompt.        | Redux, `imagen-4.0-generate-001`                                                |
|                                      | **Direct Panel Manipulation**: Move and resize panels directly on the page to fine-tune composition.   | React                                                                           |
|                                      | **Undo/Redo History**: Step backward and forward through all creative and layout changes.              | `redux-undo`                                                                    |
| 📤 **Professional Export**           | **Multi-Page PDF Export**: Generate a high-quality, print-ready PDF of the entire comic book.          | `jsPDF`, `html2canvas`                                                          |
|                                      | **CBZ Archive Export**: Create a standard `.cbz` file compatible with all major comic book readers.    | `JSZip`                                                                         |
| ⚙️ **Advanced Customization**        | **Savable Presets**: Save and load complete sets of generation settings.                               | IndexedDB                                                                       |
|                                      | **Speech Bubble Styling**: Full control over font, style, color, opacity, and placement algorithm.     | React, CSS, D3.js                                                               |
| 🌐 **Modern Web Platform**           | **Installable PWA**: Native app-like experience with full offline access.                                | Service Worker, Web App Manifest                                                |
|                                      | **Enhanced Caching**: `StaleWhileRevalidate` strategy for all API sources and app shell.               | `Workbox`                                                                       |
|                                      | **Responsive Design**: Fluid UI for desktop, tablet, and mobile.                                       | Tailwind CSS                                                                    |
|                                      | **Multilingual (i18n)**: Fully functional in English and German.                                       | React Context API                                                               |

### 🎬 The Creative Workflow: A Director's Cut

Follow this professional production pipeline to turn your text into a complete comic book:

1.  **Project Inception & Global Analysis**: Begin by importing your text from the library, a file, or by pasting. The AI performs an initial analysis, setting up your project with chapters, scenes, and a preliminary list of detected characters, locations, and props.
2.  **Pre-Production: Forging the Visual Canon**: Navigate to the **World-Building Hub**. This is where you establish the visual language for your story to ensure consistency.
    -   Generate reference images for your **Characters**, **Locations**, and **Props**.
    -   Edit their descriptions to be hyper-specific. This is your primary tool for controlling the AI's output.
    -   Create a **Pose Library** for each character to ensure their actions and emotions are depicted accurately.
3.  **The Writer's Room: Script Review & Prompt Engineering**: From the Project Dashboard, select a chapter to enter the **Script Review**. Here, you refine the AI's interpretation of each scene. **Editing the visual prompt is your most powerful tool for creative control.** Use cinematic language: specify camera angles, lighting, and character emotions.
4.  **The Layout Desk: Page Composition**: Go to the **Page Layout** editor. Select a chapter, choose the scenes you want to appear on a single page, and click "Generate Page". The algorithmic engine will compose a professional layout based on each scene's "action score". Repeat this process to build out your entire comic.
5.  **Post-Production & The Final Cut**: Open the **Comic Viewer** to see all your generated pages in a storyboard layout.
    -   **Drag and drop** pages to re-order the narrative flow.
    -   Click a page to enter the full-screen viewer. Interact directly with panels to **regenerate the image**, **generate a video**, or **generate audio** for the dialogue.
    -   **Move and resize** panels on the page for the perfect composition.
6.  **Distribution: Exporting Your Masterpiece**: Once you're satisfied, use the export buttons in the Comic Viewer to download your complete comic as a high-quality PDF or CBZ file.

### 🛠️ Architectural Deep Dive

-   **Frontend & State Management**:
    -   **Framework**: [React 19](https://react.dev/) with Hooks and a functional component architecture.
    -   **State**: [Redux Toolkit](https://redux-toolkit.js.org/) provides a centralized, immutable state container. The main `project` slice is wrapped with `redux-undo`, enabling robust history management for all creative changes.
    -   **Selectors**: [Reselect](https://github.com/reduxjs/reselect) is used to create memoized selectors, preventing unnecessary re-renders and optimizing performance, especially in the comic library and during state updates.
    -   **Middleware**: A custom auto-save middleware debounces state changes and persists the entire project to IndexedDB, ensuring no work is lost and providing a seamless user experience.

-   **AI Integration & Data Layer (Service Pattern)**:
    -   **Unified Search Service**: A central `bookSearchService` orchestrates parallel API calls to all online libraries using `Promise.allSettled` for maximum fault tolerance (a "Circuit Breaker" pattern).
    -   **Adapter Pattern**: Pure functions adapt heterogeneous API responses into a consistent Unified Domain Model (`LibraryBook`), decoupling the UI from data sources.
    -   **Resilient Fetching**: A custom `robustFetch` utility wraps the native Fetch API, implementing automatic retries with exponential backoff for all network requests.
    -   **Gemini API**: A robust `makeApiRequest` wrapper centralizes all Gemini API calls, implementing an exponential backoff with jitter retry strategy. This ensures high resilience against transient network errors and API rate limits.

-   **Algorithmic Composition Engine (D3.js)**:
    -   **Panel Layout**: `d3-hierarchy` with `d3-treemap` generates the panel layouts. The specific tiling algorithm (e.g., `treemapSquarify`, `treemapSliceDice`) is user-configurable, allowing for different visual styles while ensuring mathematical precision.
    -   **Speech Bubble Physics**: A `d3-force` simulation runs inside a dedicated **Web Worker** to prevent UI blocking. It calculates collision-free positions for speech bubbles, treating them as physical objects that repel each other within the boundaries of their parent panel.

-   **Persistence Layer (Client-Side Database)**:
    -   **Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via the lightweight `idb` library provides a robust, queryable, non-blocking database in the browser.
    -   **Schema**: Data is normalized across multiple object stores (`projects_meta`, `project_data`, `project_pages`, `media_blobs`) for performance. This separation prevents loading large media blobs when only project metadata is needed (e.g., in the library view), drastically improving load times.

-   **PWA & Caching Strategy**:
    -   **Service Worker**: Managed by [Workbox](https://developer.chrome.com/docs/workbox), it enables full offline functionality and advanced caching.
    -   **Caching**: A multi-tiered strategy is employed:
        -   `CacheFirst` for immutable assets like fonts and CDN-hosted libraries.
        -   `StaleWhileRevalidate` for the app shell (HTML, JS) and all external APIs, ensuring fast, cached loads while fetching updates in the background for a fresh-while-fast experience.

### 🚀 Getting Started

This application requires a Google Gemini API key to function. The key is entered by the user in the app settings and stored encrypted in IndexedDB on-device.

### 🌍 Live Demo

`https://qnbs.github.io/Comic-Gen-PWA/`

### 🚀 Deployment Instructions (GitHub Pages)

1. Push changes to `main`.
2. Open **Settings → Pages** and select **GitHub Actions** as source.
3. Ensure workflow `.github/workflows/deploy.yml` is enabled.
4. Wait for the workflow run to complete.
5. Open the live URL above.

### 🔐 How to set Gemini API Key

1. Open **Settings → General → Gemini API Key**.
2. Paste your API key and save it.
3. The key is encrypted via Web Crypto and stored in IndexedDB only.
4. Recommended restriction in Google AI Studio: `https://qnbs.github.io/Comic-Gen-PWA/*`.

### 🛠️ Troubleshooting

- **Blank page on GitHub Pages**: verify `base` in `vite.config.ts` is correct for the repo path.
- **Assets not loading**: ensure `manifest` and script URLs are relative in `index.html`.
- **Direct URL/refresh fails**: ensure root `404.html` exists for SPA fallback.
- **Offline/PWA issues**: clear old service worker/site data and reload once online.

### ✅ Smoke-Check Runbook (Release Checklist)

Use this quick checklist before every release/deploy:

- [ ] **Import flow**: Test all three inputs (Online Library, `.txt` upload, Paste Text).
- [ ] **Project generation**: Create a project, verify chapter/scene extraction and no blocking errors.
- [ ] **Settings flow**: Open `Settings → Generation/General/Data`, save values, reload app, verify persistence.
- [ ] **Help flow**: Open Help page from app navigation and verify content renders in current language.
- [ ] **Export flow**: Export at least one comic as PDF and CBZ and open both files.
- [ ] **Library flow**: Save/load/delete one project from Comic Library.
- [ ] **PWA basics**: Confirm app shell loads offline after one successful online session.
- [ ] **Deployment sanity**: Verify GitHub Actions Pages run is green and live URL returns HTTP 200.

> ⚠️ **Legal Disclaimer (Educational Use Only)**
>
> This software and generated content are provided for educational and creative purposes only.
> It does not provide medical, legal, or professional advice.
> Users are solely responsible for compliance with local laws, regulations, and platform policies.

---
<br>

## Deutsch

### 🌟 Über das Projekt

Comic-Gen PWA ist ein hochmodernes Kreativstudio, das das narrative Geschichtenerzählen neu erfindet. Es bietet einen professionellen, projektbasierten Workflow, um jeden Text – von klassischen Romanen bis hin zu Originalskripten – in ein vollständiges, visuell konsistentes Comic-Buch umzuwandeln. Diese Anwendung geht weit über die einfache Bilderzeugung hinaus, indem sie den Benutzer in den "Regiestuhl" versetzt und ihm eine tiefgreifende kreative Kontrolle über jede Phase der Produktionspipeline gibt.

Entwickelt als installierbare, offline-fähige Progressive Web App, gewährleistet sie ein nahtloses, leistungsstarkes Erlebnis auf jedem Gerät, wobei alle Projektdaten sicher und privat auf der Client-Seite mithilfe einer robusten IndexedDB-Architektur gespeichert werden.

### 🧠 Kernphilosophie: Die Hybride KI-algorithmische Engine

Die Stärke dieser Anwendung liegt in ihrer **hybriden Engine**, einer fortschrittlichen Architektur, die Aufgaben intelligent an die Systeme delegiert, die für sie am besten geeignet sind. Dies löst die fundamentalen Herausforderungen generativer KI – Unvorhersehbarkeit und mangelnde Struktur – durch die Schaffung einer synergistischen Partnerschaft zwischen kreativer KI und logischen Algorithmen.

-   **🤖 KI für Kreativität & Interpretation (Der "Künstler")**: Die Google Gemini API-Suite übernimmt die nuancierten, kreativen und semantischen Aufgaben. Sie agiert als digitaler Künstler, Autorenteam und Geräuschemacher des Projekts. Dazu gehören die Analyse der Erzählstruktur, das Verständnis des Szenenkontextes, die Erstellung evokativer visueller Prompts und die eigentliche Erstellung von Grafiken, Video-Loops und Text-zu-Sprache-Dialogen.
    -   **Textanalyse:** `gemini-2.5-pro`
    -   **Bilderzeugung:** `imagen-4.0-generate-001`
    -   **Videoerzeugung:** `veo-3.1-fast-generate-preview`
    -   **Text-zu-Sprache:** `gemini-2.5-flash-preview-tts`

-   **📐 Algorithmen für Struktur & Präzision (Der "Techniker")**: Deterministische Algorithmen, angetrieben von der D3.js-Bibliothek, verwalten Aufgaben, die mathematische Präzision und unerschütterliche Struktur erfordern. Diese Schicht fungiert als Layout-Künstler und Physik-Engine des Projekts. Sie ist verantwortlich für die Berechnung ausgewogener, professioneller Panel-Layouts basierend auf der Wichtigkeit der Szene (`d3-hierarchy`) und die Durchführung von Echtzeit-Physiksimulationen zur Platzierung von Sprechblasen an ästhetisch ansprechenden, kollisionsfreien Positionen (`d3-force` in einem Web Worker).

Diese strategische Trennung der Zuständigkeiten ermöglicht ein Endprodukt, das sowohl kreativ reichhaltig als auch professionell komponiert ist.

### ✨ Feature-Matrix

| Kategorie                                | Merkmal                                                                                                   | Technologie-Stack                                                               |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 📂 **Projekt-Lebenszyklus-Management**   | Professioneller, projektbasierter Workflow für ganze Bücher mit Kapitel-Unterstützung.                    | Redux Toolkit, IndexedDB                                                        |
|                                            | Persistenter, performanter lokaler Speicher für alle Projektdaten und Medien-Blobs.                       | `idb`-Bibliothek, PWA Service Worker                                            |
|                                            | Vollständige Comic-Bibliothek mit debounced Suche, Sortierung und Mehrfachauswahl/Massenlöschung.         | React, Reselect                                                                 |
|                                            | Vollständiger Projekt-Import/Export, der alle Daten und Medien in einer einzigen `.json`-Datei bündelt.   | JSZip, File API                                                                 |
| 🤖 **KI-gestützte Narrative Dekonstruktion** | **Vereinheitlichte Suche** über Gutenberg, OpenLibrary, Wikimedia & DTA; auch `.txt`-Upload & Texteingabe. | `Promise.allSettled`, Service Layer                                             |
|                                            | Globale Textanalyse zur automatischen Strukturierung von Manuskripten in Kapitel.                       | `gemini-2.5-pro`                                                                |
|                                            | Szenensegmentierung zur Aufteilung von Kapiteln in diskrete, erzählerisch kohärente Einheiten.          | `gemini-2.5-pro`                                                                |
|                                            | Tiefgehende Szenenanalyse für Zusammenfassungen, Charaktere, Dialoge und KI-generierte visuelle Prompts. | `gemini-2.5-pro`                                                                |
|                                            | **Erweiterte DTA-Integration:** Parst TEI/XML für hochwertige Textextraktion.                             | `DOMParser`                                                                     |
| 🎨 **World-Building & Visueller Kanon**    | **Charakterbögen**: Generieren kanonischer Referenzbilder und Beschreibungen für visuelle Konsistenz.   | `imagen-4.0-generate-001`                                                       |
|                                            | **Schauplatz- & Requisitenbögen**: Erstellen von Konzeptzeichnungen für wichtige Schauplätze und Gegenstände. | `imagen-4.0-generate-001`                                                       |
|                                            | **Posen- & Ausdrucksbibliothek**: Aufbau einer charakterspezifischen Bibliothek von dynamischen Posen.    | `imagen-4.0-generate-001`                                                       |
| 🎬 **Dynamische Mediengenerierung**       | **Hochwertige Panel-Grafiken**: Bilderzeugung mit Unterstützung für mehrere Kunststile und negative Prompts. | `imagen-4.0-generate-001`                                                       |
|                                            | **Video-Panel-Generierung**: Umwandlung jedes statischen Panels in einen kurzen, filmischen Video-Loop. | `veo-3.1-fast-generate-preview`                                                 |
|                                            | **Text-zu-Sprache-Dialog**: Generierung und Wiedergabe von gesprochenen Dialogen mit wählbaren Stimmen.   | `gemini-2.5-flash-preview-tts`                                                  |
| 🖌️ **Postproduktion & Verfeinerung**     | **Interaktiver Comic-Viewer**: Eine Storyboard-Ansicht aller Seiten mit Drag-and-Drop-Neuanordnung.        | React                                                                           |
|                                            | **In-Situ-Panel-Regeneration**: Klick auf ein Panel zur Neugenerierung des Bildes mit modifiziertem Prompt. | Redux, `imagen-4.0-generate-001`                                                |
|                                            | **Direkte Panel-Manipulation**: Verschieben und Ändern der Größe von Panels direkt auf der Seite.         | React                                                                           |
|                                            | **Rückgängig/Wiederholen-Verlauf**: Schritte durch alle kreativen und Layout-Änderungen.                 | `redux-undo`                                                                    |
| 📤 **Professioneller Export**            | **Mehrseitiger PDF-Export**: Erzeugung eines hochwertigen, druckfertigen PDFs des gesamten Comic-Buchs.  | `jsPDF`, `html2canvas`                                                          |
|                                            | **CBZ-Archiv-Export**: Erstellung einer Standard-`.cbz`-Datei, kompatibel mit allen gängigen Comic-Readern. | `JSZip`                                                                         |
| ⚙️ **Erweiterte Anpassung**               | **Speicherbare Voreinstellungen**: Speichern und Laden kompletter Sätze von Generierungseinstellungen.      | IndexedDB                                                                       |
|                                            | **Sprechblasen-Styling**: Volle Kontrolle über Schriftart, Stil, Farbe, Deckkraft und Platzierungsalgorithmus. | React, CSS, D3.js                                                               |
| 🌐 **Moderne Web-Plattform**             | **Installierbare PWA**: Natives App-Gefühl mit vollem Offline-Zugriff.                                  | Service Worker, Web App Manifest                                                |
|                                            | **Erweitertes Caching**: `StaleWhileRevalidate`-Strategie für alle API-Quellen und die App-Shell.       | `Workbox`                                                                       |
|                                            | **Responsive Design**: Flüssige UI für Desktop, Tablet und Mobilgeräte.                                | Tailwind CSS                                                                    |
|                                            | **Mehrsprachig (i18n)**: Voll funktionsfähig in Englisch und Deutsch.                                 | React Context API                                                               |

### 🎬 Der kreative Arbeitsablauf: Director's Cut

Folgen Sie dieser professionellen Produktionspipeline, um Ihren Text in ein komplettes Comic-Buch zu verwandeln:

1.  **Projektstart & Globale Analyse**: Beginnen Sie mit dem Import Ihres Textes. Die KI führt eine Erstanalyse durch, richtet Ihr Projekt mit Kapiteln, Szenen und einer vorläufigen Liste der erkannten Charaktere, Orte und Requisiten ein.
2.  **Vorproduktion: Den visuellen Kanon schmieden**: Navigieren Sie zum **World-Building Hub**. Hier legen Sie die visuelle Sprache für Ihre Geschichte fest, um Konsistenz zu gewährleisten.
    -   Generieren Sie Referenzbilder für Ihre **Charaktere**, **Orte** und **Requisiten**.
    -   Bearbeiten Sie deren Beschreibungen so hyper-spezifisch wie möglich. Dies ist Ihr wichtigstes Werkzeug zur Steuerung der KI-Ausgabe.
    -   Erstellen Sie eine **Posen-Bibliothek** für jeden Charakter, um sicherzustellen, dass deren Handlungen und Emotionen korrekt dargestellt werden.
3.  **Der Autorenraum: Skript-Überprüfung & Prompt-Engineering**: Wählen Sie im Projekt-Dashboard ein Kapitel aus, um zur **Skript-Überprüfung** zu gelangen. Hier verfeinern Sie die Interpretation der KI für jede Szene. **Die Bearbeitung des visuellen Prompts ist Ihr mächtigstes Werkzeug für kreative Kontrolle.** Verwenden Sie eine filmische Sprache: Geben Sie Kamerawinkel, Beleuchtung und Charakteremotionen an.
4.  **Der Layout-Tisch: Seitenkomposition**: Gehen Sie zum **Seitenlayout**-Editor. Wählen Sie ein Kapitel, die Szenen, die Sie auf einer Seite haben möchten, und klicken Sie auf "Seite generieren". Die algorithmische Engine erstellt ein professionelles Layout basierend auf dem "Action Score" jeder Szene. Wiederholen Sie diesen Vorgang, um Ihren gesamten Comic zu erstellen.
5.  **Postproduktion & Der finale Schnitt**: Öffnen Sie den **Comic-Viewer**, um alle Ihre generierten Seiten in einer Storyboard-Ansicht zu sehen.
    -   **Ziehen und ablegen (Drag & Drop)** Sie Seiten, um den narrativen Fluss neu zu ordnen.
    -   Klicken Sie auf eine Seite, um den Vollbild-Viewer zu öffnen. Interagieren Sie direkt mit Panels, um das **Bild neu zu generieren**, ein **Video zu erstellen** oder **Audio** für den Dialog zu generieren.
    -   **Verschieben und vergrößern/verkleinern** Sie Panels auf der Seite für die perfekte Komposition.
6.  **Distribution: Exportieren Sie Ihr Meisterwerk**: Sobald Sie zufrieden sind, verwenden Sie die Export-Schaltflächen im Comic-Viewer, um Ihren vollständigen Comic als hochwertige PDF- oder CBZ-Datei herunterzuladen.

### 🛠️ Architektonischer Einblick

-   **Frontend & Zustandsverwaltung**:
    -   **Framework**: [React 19](https://react.dev/) mit Hooks und einer funktionalen Komponentenarchitektur.
    -   **Zustand**: [Redux Toolkit](https://redux-toolkit.js.org/) bietet einen zentralisierten, unveränderlichen Zustandscontainer. Der Haupt-`project`-Slice ist mit `redux-undo` umschlossen, was ein robustes Verlaufsmanagement ermöglicht.
    -   **Selektoren**: [Reselect](https://github.com/reduxjs/reselect) wird verwendet, um memoisierte Selektoren zu erstellen, die unnötige Neu-Renderings verhindern und die Leistung optimieren.
    -   **Middleware**: Eine benutzerdefinierte Auto-Save-Middleware debounct Zustandsänderungen und speichert das gesamte Projekt in IndexedDB, um sicherzustellen, dass keine Arbeit verloren geht.

-   **KI-Integration & Datenschicht (Service-Muster)**:
    -   **Vereinheitlichter Suchdienst**: Ein zentraler `bookSearchService` orchestriert parallele API-Aufrufe an alle Online-Bibliotheken mittels `Promise.allSettled` für maximale Fehlertoleranz ("Circuit Breaker"-Muster).
    -   **Adapter-Muster**: Reine Funktionen adaptieren heterogene API-Antworten in ein konsistentes einheitliches Domänenmodell (`LibraryBook`) und entkoppeln so die UI von den Datenquellen.
    -   **Widerstandsfähiges Fetching**: Ein benutzerdefiniertes `robustFetch`-Dienstprogramm umschließt die native Fetch-API und implementiert automatische Wiederholungsversuche mit exponentiellem Backoff für alle Netzwerkanfragen.

-   **Algorithmische Kompositions-Engine (D3.js)**:
    -   **Panel-Layout**: `d3-hierarchy` mit `d3-treemap` erzeugt die Panel-Layouts. Der Kachel-Algorithmus (z.B. `treemapSquarify`) ist benutzerkonfigurierbar.
    -   **Sprechblasen-Physik**: Eine `d3-force`-Simulation läuft in einem dedizierten **Web Worker**, um ein Blockieren der UI zu verhindern und kollisionsfreie Positionen für Sprechblasen zu berechnen.

-   **Persistenzschicht (Client-seitige Datenbank)**:
    -   **Speicher**: [IndexedDB](https://developer.mozilla.org/de/docs/Web/API/IndexedDB_API) über die `idb`-Bibliothek bietet eine robuste, nicht-blockierende Datenbank im Browser.
    -   **Schema**: Die Daten sind zur Leistungssteigerung auf mehrere Objektspeicher (`projects_meta`, `project_data`, `project_pages`, `media_blobs`) normalisiert, um das Laden von Metadaten zu beschleunigen.

-   **PWA & Caching-Strategie**:
    -   **Service Worker**: Verwaltet durch [Workbox](https://developer.chrome.com/docs/workbox), ermöglicht er Offline-Funktionalität und erweitertes Caching.
    -   **Caching**: Eine mehrstufige Strategie wird angewendet:
        -   `CacheFirst` für unveränderliche Assets wie Schriftarten und CDN-Bibliotheken.
        -   `StaleWhileRevalidate` für die App-Shell (HTML, JS) und alle externen APIs, um schnelle Ladezeiten bei gleichzeitiger Aktualisierung im Hintergrund zu gewährleisten.

### 🚀 Erste Schritte

Diese Anwendung benötigt einen Google Gemini API-Schlüssel, um zu funktionieren. Der Schlüssel wird in der App unter Einstellungen hinterlegt und verschlüsselt in IndexedDB auf dem Gerät gespeichert.

### 🌍 Live Demo

`https://qnbs.github.io/Comic-Gen-PWA/`

### ✅ Smoke-Check Runbook (Release-Checkliste)

Diese kurze Checkliste vor jedem Release/Deploy durchgehen:

- [ ] **Import-Flow**: Alle drei Eingaben testen (Online-Bibliothek, `.txt`-Upload, Texteingabe).
- [ ] **Projektgenerierung**: Projekt erstellen, Kapitel-/Szenenextraktion und fehlende Blocker prüfen.
- [ ] **Settings-Flow**: `Einstellungen → Generierung/Allgemein/Daten` öffnen, Werte speichern, App neu laden, Persistenz prüfen.
- [ ] **Hilfe-Flow**: Hilfe-Seite über die Navigation öffnen und Rendering in aktiver Sprache prüfen.
- [ ] **Export-Flow**: Mindestens einen Comic als PDF und CBZ exportieren und beide Dateien öffnen.
- [ ] **Bibliothek**: Ein Projekt in der Comic-Bibliothek speichern/laden/löschen.
- [ ] **PWA-Basics**: Nach einer Online-Session prüfen, dass die App-Shell offline lädt.
- [ ] **Deployment-Sanity**: GitHub-Actions-Pages-Run grün und Live-URL mit HTTP 200.

### 🚀 Deployment-Anleitung (GitHub Pages)

1. Änderungen nach `main` pushen.
2. Unter **Settings → Pages** als Quelle **GitHub Actions** wählen.
3. Workflow `.github/workflows/deploy.yml` aktiv lassen.
4. Workflow durchlaufen lassen.
5. Anschließend die Live-URL öffnen.

### 🔐 Gemini API-Schlüssel setzen

1. Öffnen Sie **Einstellungen → Allgemein → Gemini API-Schlüssel**.
2. API-Schlüssel einfügen und speichern.
3. Der Schlüssel wird mit Web Crypto verschlüsselt und nur in IndexedDB gespeichert.
4. Empfohlene Beschränkung in Google AI Studio: `https://qnbs.github.io/Comic-Gen-PWA/*`.

### 🛠️ Fehlerbehebung

- **Leere Seite auf GitHub Pages**: prüfen, ob `base` in `vite.config.ts` korrekt ist.
- **Assets laden nicht**: relative Pfade in `index.html` für Manifest und Module sicherstellen.
- **Direktlink/Refresh schlägt fehl**: prüfen, ob `404.html` im Root liegt.
- **Offline/PWA-Probleme**: alten Service Worker/Sitedaten löschen und neu laden.

> ⚠️ **Rechtlicher Hinweis (nur Bildungszwecke)**
>
> Diese Software und die erzeugten Inhalte dienen ausschließlich Bildungs- und Kreativzwecken.
> Sie stellen keine medizinische, rechtliche oder professionelle Beratung dar.
> Nutzer sind selbst verantwortlich für die Einhaltung lokaler Gesetze, Vorschriften und Plattformrichtlinien.
