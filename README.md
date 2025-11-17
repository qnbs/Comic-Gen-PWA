# Comic-Gen PWA

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Redux](https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Gemini API](https://img.shields.io/badge/Gemini_API-2.5_Pro_|_Imagen_4-4285F4?style=for-the-badge&logo=google)
![D3.js](https://img.shields.io/badge/D3.js-Layouts-F9A03C?style=for-the-badge&logo=d3.js)
![PWA](https://img.shields.io/badge/PWA-Installable-8A2BE2?style=for-the-badge)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB-E65100?style=for-the-badge)

A sophisticated Progressive Web App that functions as a complete studio for transforming literary text into vibrant, multi-page comic books.

---

## English

### 🌟 About The Project

Comic-Gen PWA is a state-of-the-art creative tool that reimagines storytelling. It converts any text—from classic novels to original scripts—into a complete, visually consistent comic book. This application moves far beyond simple image generation by offering a full, project-based workflow that gives the user deep creative control over the final product.

It's designed as an installable, offline-capable Progressive Web App, ensuring a seamless experience on any device.

### 🧠 Core Philosophy: A Hybrid AI-Algorithmic Engine

The power of this application lies in its **hybrid engine**, which intelligently delegates tasks to the systems best suited for them:

-   **AI for Creativity & Interpretation**: The Google Gemini API suite handles the nuanced, creative tasks. This includes analyzing narrative structure, understanding scene context, generating evocative visual prompts, and creating the actual artwork, video, and audio. It excels at tasks requiring a grasp of language and artistic creation.
-   **Algorithms for Structure & Precision**: Deterministic algorithms, primarily using the D3.js library, manage tasks that demand mathematical precision and consistent structure. This includes calculating balanced panel layouts based on scene importance and running physics simulations to place speech bubbles without collision. This approach solves common AI challenges, such as inconsistent layouts, by enforcing a logical structure.

This synergy allows for a final product that is both creatively rich and professionally composed, leveraging the best of both worlds.

### ✨ Key Features

#### 📂 Project Management & Library
- **Project-Based Workflow**: Manage entire books as single, cohesive projects.
- **Persistent Local Storage**: All projects and settings are saved securely in your browser's IndexedDB, allowing you to stop and resume your work at any time.
- **Full Comic Library**: Browse, search, and sort all your saved comic projects in a dedicated library view.

#### 🤖 Intelligent Content Pipeline
- **Multi-Source Import**: Start a project by browsing the public domain Gutendex library, uploading a `.txt` file, or pasting text directly.
- **Full-Text Analysis**: Gemini Pro performs an initial deep-dive analysis of the entire source text to automatically structure it into chapters and scenes.
- **Interactive Script Review**: A crucial step for creative direction. Edit the AI's interpretation of each scene, including its summary, dialogue, and—most importantly—the **visual prompt** that dictates the final artwork.

#### 🎨 Advanced World-Building for Visual Consistency
- **Character Sheets**: Generate a canonical reference image and a detailed visual description for every character.
- **Location Sheets**: Create concept art for key settings to ensure they appear consistent throughout the story.
- **Prop Sheets**: Define the appearance of important items and objects.
- **Pose & Expression Library**: For each character, build a library of specific poses and expressions (e.g., "furious," "pensive") to guide the AI, drastically improving character consistency across panels.

#### 🎬 Rich Media & Interactivity
- **Video Panel Generation**: Convert any static panel into a short, looping video clip using the Veo model.
- **Text-to-Speech Dialogue**: Generate and play spoken dialogue for any speech bubble using Gemini TTS, bringing your comic to life.
- **Movable & Resizable Panels**: Directly manipulate the comic page layout by dragging and resizing panels to perfect the composition.

####  professional Export & Customization
- **Multi-Page Export**: Download your entire comic as a `.cbz` archive (for comic book readers) or a universal multi-page `.pdf`.
- **Deep Customization**: Fine-tune every aspect of the final look, including art styles (e.g., Manga, Noir, Watercolor), image quality, panel aspect ratios, and more.
- **Speech Bubble Styling**: Customize the font, style (rounded, sharp, cloud), color, and opacity of speech bubbles.
- **Savable Presets**: Save your favorite set of generation settings as a named preset for quick reuse in future projects.

#### 🌐 Modern Web Platform
- **Progressive Web App (PWA)**: Installable on desktop and mobile devices for a native app-like experience, with offline access enabled by a service worker.
- **Responsive Design**: A fluid user interface that adapts to all screen sizes.
- **Light & Dark Mode**: Switch themes for optimal viewing comfort.
- **Multilingual (i18n)**: Fully translated and functional in both English and German.

###  workflow The Creative Workflow

Follow these steps to turn your text into a complete comic book:

1.  **Create Your Project**: Begin by importing your text via the library, file upload, or by pasting it. The AI performs an initial analysis, setting up your project with chapters, scenes, and a list of detected characters, locations, and props.
2.  **Build Your World (Crucial for Consistency)**: Navigate to the **World-Building Hub**. This is where you establish the visual canon for your story.
    -   Generate reference images for your **Characters**, **Locations**, and **Props**.
    -   Edit their descriptions to be as specific as possible.
    -   Create a **Pose Library** for each character to ensure their actions and emotions are depicted consistently.
3.  **Review the Script (Optional but Recommended)**: From the Project Dashboard, select a chapter to enter the **Script Review**. Here, you can refine the AI's interpretation of each scene. **Editing the visual prompt is your most powerful tool for creative control.**
4.  **Layout & Generate Pages**: Go to the **Page Layout** editor. Select a chapter, choose the scenes you want to appear on a single page, and click "Generate Page". Repeat this process to build out your entire comic.
5.  **View, Organize & Refine**: Open the **Comic Viewer** to see all your generated pages in a storyboard layout.
    -   **Drag and drop** pages to re-order the narrative flow.
    -   Interact directly with panels to **regenerate the image**, **generate a video**, or **generate audio** for the dialogue.
    -   **Move and resize** panels on the page for the perfect composition.
6.  **Export Your Masterpiece**: Once you're satisfied, use the export buttons in the Comic Viewer to download your complete comic as a high-quality PDF or CBZ file.

### 🛠️ Technology Deep Dive

-   **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/), [Reselect](https://github.com/reduxjs/reselect)
-   **AI Services (Google Gemini API)**:
    -   **Text Analysis**: `gemini-2.5-pro`
    -   **Image Generation**: `imagen-4.0-generate-001`
    -   **Video Generation**: `veo-3.1-fast-generate-preview`
    -   **Text-to-Speech**: `gemini-2.5-flash-preview-tts`
-   **Client-Side Layout & Simulation**: [D3.js](https://d3js.org/)
    -   `d3-hierarchy`: For treemap-based panel layouts.
    -   `d3-force`: For physics-based speech bubble positioning (run in a Web Worker).
-   **Client-Side Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) via the `idb` library.
-   **Progressive Web App**: Service Worker managed by [Workbox](https://developer.chrome.com/docs/workbox).
-   **File Handling & Export**: [JSZip](https://stuk.github.io/jszip/) (for CBZ), [jsPDF](https://github.com/parallax/jsPDF).

### 🚀 Getting Started

This application requires a Google Gemini API key to function. The key must be configured as an environment variable (`API_KEY`) in the execution environment.

---
<br>

## Deutsch

### 🌟 Über das Projekt

Comic-Gen PWA ist ein hochmodernes Kreativwerkzeug, das das Geschichtenerzählen neu erfindet. Es wandelt jeden Text – von klassischen Romanen bis hin zu Originalskripten – in ein vollständiges, visuell konsistentes Comic-Buch um. Diese Anwendung geht weit über die einfache Bilderzeugung hinaus und bietet einen vollständigen, projektbasierten Workflow, der dem Benutzer tiefgreifende kreative Kontrolle über das Endprodukt gibt.

Es ist als installierbare, offline-fähige Progressive Web App konzipiert, die ein nahtloses Erlebnis auf jedem Gerät gewährleistet.

### 🧠 Kernphilosophie: Eine hybride KI-algorithmische Engine

Die Stärke dieser Anwendung liegt in ihrer **hybriden Engine**, die Aufgaben intelligent an die Systeme delegiert, die für sie am besten geeignet sind:

-   **KI für Kreativität & Interpretation**: Die Google Gemini API-Suite übernimmt die nuancierten, kreativen Aufgaben. Dazu gehören die Analyse der Erzählstruktur, das Verständnis des Szenenkontextes, die Erstellung evokativer visueller Prompts und die eigentliche Erstellung von Grafiken, Videos und Audio. Sie brilliert bei Aufgaben, die ein Verständnis für Sprache und künstlerische Schöpfung erfordern.
-   **Algorithmen für Struktur & Präzision**: Deterministische Algorithmen, hauptsächlich unter Verwendung der D3.js-Bibliothek, verwalten Aufgaben, die mathematische Präzision und konsistente Struktur erfordern. Dazu gehören die Berechnung ausgewogener Panel-Layouts basierend auf der Wichtigkeit der Szene und die Durchführung von Physiksimulationen zur kollisionsfreien Platzierung von Sprechblasen. Dieser Ansatz löst gängige KI-Herausforderungen wie inkonsistente Layouts, indem eine logische Struktur erzwungen wird.

Diese Synergie ermöglicht ein Endprodukt, das sowohl kreativ reichhaltig als auch professionell komponiert ist und das Beste aus beiden Welten nutzt.

### ✨ Hauptmerkmale

#### 📂 Projektmanagement & Bibliothek
- **Projektbasierter Workflow**: Verwalten Sie ganze Bücher als einzelne, zusammenhängende Projekte.
- **Persistenter lokaler Speicher**: Alle Projekte und Einstellungen werden sicher in der IndexedDB Ihres Browsers gespeichert, sodass Sie Ihre Arbeit jederzeit unterbrechen und fortsetzen können.
- **Vollständige Comic-Bibliothek**: Durchsuchen, suchen und sortieren Sie alle Ihre gespeicherten Comic-Projekte in einer dedizierten Bibliotheksansicht.

#### 🤖 Intelligente Inhalts-Pipeline
- **Multi-Quellen-Import**: Starten Sie ein Projekt durch Durchsuchen der gemeinfreien Gutendex-Bibliothek, Hochladen einer `.txt`-Datei oder direktes Einfügen von Text.
- **Volltext-Analyse**: Gemini Pro führt eine anfängliche Tiefenanalyse des gesamten Quelltextes durch, um ihn automatisch in Kapitel und Szenen zu strukturieren.
- **Interaktive Skript-Überprüfung**: Ein entscheidender Schritt für die kreative Steuerung. Bearbeiten Sie die KI-Interpretation jeder Szene, einschließlich Zusammenfassung, Dialog und – am wichtigsten – des **visuellen Prompts**, der die endgültige Grafik bestimmt.

#### 🎨 Erweitertes World-Building für visuelle Konsistenz
- **Charakterbögen**: Erstellen Sie ein kanonisches Referenzbild und eine detaillierte visuelle Beschreibung für jeden Charakter.
- **Schauplatzbögen**: Erstellen Sie Konzeptzeichnungen für wichtige Schauplätze, um deren konsistentes Erscheinungsbild in der gesamten Geschichte zu gewährleisten.
- **Requisitenbögen**: Definieren Sie das Aussehen wichtiger Gegenstände und Objekte.
- **Posen- & Ausdrucksbibliothek**: Bauen Sie für jeden Charakter eine Bibliothek spezifischer Posen und Ausdrücke (z.B. "wütend", "nachdenklich") auf, um die KI zu leiten, was die Charakterkonsistenz über die Panels hinweg drastisch verbessert.

#### 🎬 Rich Media & Interaktivität
- **Video-Panel-Generierung**: Wandeln Sie jedes statische Panel mit dem Veo-Modell in einen kurzen, Endlos-Videoclip um.
- **Text-zu-Sprache-Dialog**: Generieren und spielen Sie gesprochene Dialoge für jede Sprechblase mit Gemini TTS ab und erwecken Sie Ihren Comic zum Leben.
- **Bewegliche & größenveränderbare Panels**: Manipulieren Sie das Comic-Seitenlayout direkt durch Ziehen und Ändern der Größe von Panels, um die Komposition zu perfektionieren.

####  professional Export & Anpassung
- **Mehrseitiger Export**: Laden Sie Ihr gesamtes Comic-Buch als `.cbz`-Archiv (für Comic-Reader) oder als universelles mehrseitiges `.pdf` herunter.
- **Umfassende Anpassung**: Feinabstimmung jedes Aspekts des endgültigen Aussehens, einschließlich Kunststilen (z.B. Manga, Noir, Aquarell), Bildqualität, Panel-Seitenverhältnissen und mehr.
- **Sprechblasen-Styling**: Passen Sie Schriftart, Stil (abgerundet, scharf, Wolke), Farbe und Deckkraft von Sprechblasen an.
- **Speicherbare Voreinstellungen**: Speichern Sie Ihre bevorzugten Generierungseinstellungen als benannte Voreinstellung zur schnellen Wiederverwendung in zukünftigen Projekten.

#### 🌐 Moderne Web-Plattform
- **Progressive Web App (PWA)**: Installierbar auf Desktop- und Mobilgeräten für ein natives App-Gefühl, mit Offline-Zugriff durch einen Service Worker.
- **Responsive Design**: Eine flüssige Benutzeroberfläche, die sich an alle Bildschirmgrößen anpasst.
- **Heller & Dunkler Modus**: Wechseln Sie die Themen für optimalen Sehkomfort.
- **Mehrsprachig (i18n)**: Vollständig übersetzt und funktionsfähig in Englisch und Deutsch.

###  workflow Der kreative Arbeitsablauf

Folgen Sie diesen Schritten, um Ihren Text in ein komplettes Comic-Buch zu verwandeln:

1.  **Projekt erstellen**: Beginnen Sie mit dem Import Ihres Textes über die Bibliothek, den Datei-Upload oder durch Einfügen. Die KI führt eine Erstanalyse durch und richtet Ihr Projekt mit Kapiteln, Szenen und einer Liste der erkannten Charaktere, Orte und Requisiten ein.
2.  **Welt aufbauen (Entscheidend für Konsistenz)**: Navigieren Sie zum **World-Building Hub**. Hier legen Sie den visuellen Kanon für Ihre Geschichte fest.
    -   Generieren Sie Referenzbilder für Ihre **Charaktere**, **Orte** und **Requisiten**.
    -   Bearbeiten Sie deren Beschreibungen so spezifisch wie möglich.
    -   Erstellen Sie eine **Posen-Bibliothek** für jeden Charakter, um sicherzustellen, dass deren Handlungen und Emotionen konsistent dargestellt werden.
3.  **Skript überprüfen (Optional, aber empfohlen)**: Wählen Sie im Projekt-Dashboard ein Kapitel aus, um zur **Skript-Überprüfung** zu gelangen. Hier können Sie die Interpretation der KI für jede Szene verfeinern. **Die Bearbeitung des visuellen Prompts ist Ihr mächtigstes Werkzeug für kreative Kontrolle.**
4.  **Seiten layouten & generieren**: Gehen Sie zum **Seitenlayout**-Editor. Wählen Sie ein Kapitel, die Szenen, die Sie auf einer Seite haben möchten, und klicken Sie auf "Seite generieren". Wiederholen Sie diesen Vorgang, um Ihren gesamten Comic zu erstellen.
5.  **Anzeigen, Organisieren & Verfeinern**: Öffnen Sie den **Comic-Betrachter**, um alle Ihre generierten Seiten in einer Storyboard-Ansicht zu sehen.
    -   **Ziehen und ablegen (Drag & Drop)** Sie Seiten, um den narrativen Fluss neu zu ordnen.
    -   Interagieren Sie direkt mit Panels, um das **Bild neu zu generieren**, ein **Video zu erstellen** oder **Audio** für den Dialog zu generieren.
    -   **Verschieben und vergrößern/verkleinern** Sie Panels auf der Seite für die perfekte Komposition.
6.  **Meisterwerk exportieren**: Sobald Sie zufrieden sind, verwenden Sie die Export-Schaltflächen im Comic-Betrachter, um Ihren vollständigen Comic als hochwertige PDF- oder CBZ-Datei herunterzuladen.

### 🛠️ Technologie im Detail

-   **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **Zustandsverwaltung (State Management)**: [Redux Toolkit](https://redux-toolkit.js.org/), [Reselect](https://github.com/reduxjs/reselect)
-   **KI-Dienste (Google Gemini API)**:
    -   **Textanalyse**: `gemini-2.5-pro`
    -   **Bilderzeugung**: `imagen-4.0-generate-001`
    -   **Videoerzeugung**: `veo-3.1-fast-generate-preview`
    -   **Text-zu-Sprache**: `gemini-2.5-flash-preview-tts`
-   **Client-seitiges Layout & Simulation**: [D3.js](https://d3js.org/)
    -   `d3-hierarchy`: Für Treemap-basierte Panel-Layouts.
    -   `d3-force`: Für physikbasierte Positionierung von Sprechblasen (läuft in einem Web Worker).
-   **Client-seitiger Speicher**: [IndexedDB](https://developer.mozilla.org/de/docs/Web/API/IndexedDB_API) über die `idb`-Bibliothek.
-   **Progressive Web App**: Service Worker verwaltet durch [Workbox](https://developer.chrome.com/docs/workbox).
-   **Dateiverarbeitung & Export**: [JSZip](https://stuk.github.io/jszip/) (für CBZ), [jsPDF](https://github.com/parallax/jsPDF).

### 🚀 Erste Schritte

Diese Anwendung benötigt einen Google Gemini API-Schlüssel, um zu funktionieren. Der Schlüssel muss als Umgebungsvariable (`API_KEY`) in der Ausführungsumgebung konfiguriert sein.