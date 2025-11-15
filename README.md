# Comic-Gen PWA

![Made with Gemini](https://img.shields.io/badge/Made%20with-Gemini%20API-4285F4?style=for-the-badge)
![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-8A2BE2?style=for-the-badge)

An AI-algorithmic engine to transform e-books and text into vibrant comic books. This app uses a hybrid approach, leveraging the Google Gemini API for scene analysis and image generation, while employing algorithmic techniques for page layout and composition.

---

## English

### 🌟 About The Project

Comic-Gen PWA is a progressive web application that offers a unique way to experience stories by converting them into a single-page comic format. By simply providing a piece of text, users can initiate an AI-driven process that analyzes the narrative, generates stunning visuals for key scenes, and composes them into a dynamically laid-out comic page.

This project showcases a powerful synergy between Large Language Models (LLMs) for creative interpretation and robust client-side algorithms for structured, deterministic layouting.

### ✨ Features

-   **Multiple Input Methods**: Start by browsing the public domain library, importing text from a URL, or uploading your own `.txt` file.
-   **AI-Powered Scene Analysis**: Gemini Pro analyzes the text to extract distinct scenes, summaries, characters, dialogue, and action scores.
-   **Interactive Scene Review**: Users can review, edit, and fine-tune the AI's script, including character names, the action score (which influences panel size), and the visual prompt for image generation.
-   **Consistent Character Generation**: Generate unique, consistent visual appearances for each character based on their description in the text.
-   **Customizable Page Layouts**: Choose from different layout algorithms powered by D3.js:
    -   `Balanced` (Treemap Squarify): A balanced, aesthetically pleasing layout.
    -   `Ordered` (Treemap SliceDice): A top-to-bottom or left-to-right strip layout.
    -   `Dynamic` (Treemap Binary): A more varied and dynamic composition.
-   **Visual Settings Panel**: Adjust the final look of your comic, including:
    -   Toggling speech bubbles.
    -   Changing speech bubble font size and family.
    -   Selecting image generation quality (Low, Medium, High).
    -   Setting the panel aspect ratio (1:1, 4:3, 16:9, etc.).
-   **Export Options**: Download the final comic as a `.cbz` archive for comic book readers or export it as a high-quality `.pdf` document.
-   **Session Management**: Automatically saves your progress during the scene review and character definition stages, allowing you to resume your session later.
-   **PWA Functionality**: Installable on any device for a native-app feel, with offline access to core functionalities.
-   **Light & Dark Mode**: Switch between themes for comfortable viewing.
-   **Multilingual Support**: Fully available in English and German.

### 💻 Technology Stack

-   **Frontend**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **AI & Image Generation**: [Google Gemini API](https://ai.google.dev/) (Gemini 2.5 Pro & Imagen 4)
-   **Page Layout**: [D3.js](https.d3js.org/) (`d3-hierarchy`, `d3-force`)
-   **Local Storage**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via `idb` library) for saving comics, and `localStorage` for session progress.
-   **File Handling**: [JSZip](https://stuk.github.io/jszip/) for creating `.cbz` archives.
-   **PDF Export**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

### 🚀 How to Use

1.  **Provide Text**: Start on the main screen. You can choose a classic book from the library, paste text copied from a source like Project Gutenberg, or upload your own `.txt` file.
2.  **Review Scenes**: The app will take a moment to analyze your text. You will then be presented with a "Comic Script". Review each scene, make edits to the visual prompts, and adjust action scores as needed.
3.  **Define Characters**: Based on the script, the app identifies characters. Click "Generate Appearance" for each one to create a consistent visual reference. You can re-generate until you are satisfied.
4.  **Generate Comic**: Once characters are defined, proceed to generate the full comic page. This involves generating an image for each panel and composing them.
5.  **Customize & Export**: Use the floating settings panel to fine-tune the final look. When ready, use the download buttons to save your comic as a CBZ or PDF file.

### 🏗️ Architectural Concept

The core of Comic-Gen PWA is its **hybrid AI-algorithmic approach**:

-   **AI for Creativity**: The Gemini API handles tasks that require understanding, interpretation, and creativity. This includes parsing the narrative, summarizing scenes, and, most importantly, generating the actual artwork based on complex visual prompts.
-   **Algorithms for Structure**: D3.js handles the deterministic and mathematical task of page composition. By using treemaps, it translates the "action score" of each scene into a proportional panel size and arranges them on the page according to a selected algorithm. This ensures a well-structured and visually balanced result that AI alone might struggle to produce consistently.

This division of labor leverages the strengths of both domains to create a powerful and flexible generation engine.

---
<br>

## Deutsch

### 🌟 Über das Projekt

Comic-Gen PWA ist eine progressive Webanwendung, die eine einzigartige Möglichkeit bietet, Geschichten zu erleben, indem sie in ein einseitiges Comic-Format umgewandelt werden. Durch die einfache Eingabe eines Textes können Benutzer einen KI-gesteuerten Prozess starten, der die Erzählung analysiert, beeindruckende Grafiken für Schlüsselszenen generiert und diese auf einer dynamisch gestalteten Comic-Seite zusammensetzt.

Dieses Projekt demonstriert eine leistungsstarke Synergie zwischen großen Sprachmodellen (LLMs) für die kreative Interpretation und robusten clientseitigen Algorithmen für strukturierte, deterministische Layouts.

### ✨ Funktionen

-   **Mehrere Eingabemethoden**: Beginnen Sie, indem Sie die Bibliothek gemeinfreier Bücher durchsuchen, Text von einer URL importieren oder Ihre eigene `.txt`-Datei hochladen.
-   **KI-gestützte Szenenanalyse**: Gemini Pro analysiert den Text, um einzelne Szenen, Zusammenfassungen, Charaktere, Dialoge und Aktions-Wertungen zu extrahieren.
-   **Interaktive Szenenüberprüfung**: Benutzer können das KI-Skript überprüfen, bearbeiten und verfeinern, einschließlich Charakternamen, der Aktions-Wertung (die die Panelgröße beeinflusst) und des visuellen Prompts für die Bildgenerierung.
-   **Konsistente Charaktergenerierung**: Erzeugen Sie einzigartige, konsistente visuelle Erscheinungsbilder für jeden Charakter basierend auf seiner Beschreibung im Text.
-   **Anpassbare Seitenlayouts**: Wählen Sie aus verschiedenen Layout-Algorithmen, die von D3.js unterstützt werden:
    -   `Ausgeglichen` (Treemap Squarify): Ein ausgewogenes, ästhetisch ansprechendes Layout.
    -   `Geordnet` (Treemap SliceDice): Ein Streifenlayout von oben nach unten oder von links nach rechts.
    -   `Dynamisch` (Treemap Binary): Eine abwechslungsreichere und dynamischere Komposition.
-   **Visuelle Einstellungen**: Passen Sie das endgültige Aussehen Ihres Comics an, einschließlich:
    -   Ein- und Ausblenden von Sprechblasen.
    -   Ändern der Schriftgröße und -art der Sprechblasen.
    -   Auswahl der Bildqualität (Niedrig, Mittel, Hoch).
    -   Einstellen des Seitenverhältnisses der Panels (1:1, 4:3, 16:9 usw.).
-   **Exportoptionen**: Laden Sie den fertigen Comic als `.cbz`-Archiv für Comic-Reader herunter oder exportieren Sie ihn als hochwertiges `.pdf`-Dokument.
-   **Sitzungsverwaltung**: Speichert automatisch Ihren Fortschritt während der Szenenüberprüfung und Charakterdefinition, sodass Sie Ihre Sitzung später fortsetzen können.
-   **PWA-Funktionalität**: Installierbar auf jedem Gerät für ein natives App-Gefühl, mit Offline-Zugriff auf Kernfunktionen.
-   **Heller & Dunkler Modus**: Wechseln Sie zwischen den Themen für eine angenehme Anzeige.
-   **Mehrsprachige Unterstützung**: Vollständig verfügbar in Englisch und Deutsch.

### 💻 Technologie-Stack

-   **Frontend**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **KI & Bildgenerierung**: [Google Gemini API](https://ai.google.dev/) (Gemini 2.5 Pro & Imagen 4)
-   **Seitenlayout**: [D3.js](https.d3js.org/) (`d3-hierarchy`, `d3-force`)
-   **Lokaler Speicher**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (über die `idb`-Bibliothek) zum Speichern von Comics und `localStorage` für den Sitzungsfortschritt.
-   **Dateiverarbeitung**: [JSZip](https://stuk.github.io/jszip/) zum Erstellen von `.cbz`-Archiven.
-   **PDF-Export**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

### 🚀 Anwendung

1.  **Text bereitstellen**: Beginnen Sie auf dem Hauptbildschirm. Sie können ein klassisches Buch aus der Bibliothek auswählen, Text aus einer Quelle wie Project Gutenberg einfügen oder Ihre eigene `.txt`-Datei hochladen.
2.  **Szenen überprüfen**: Die App benötigt einen Moment, um Ihren Text zu analysieren. Ihnen wird dann ein "Comic-Skript" angezeigt. Überprüfen Sie jede Szene, nehmen Sie Änderungen an den visuellen Prompts vor und passen Sie die Aktions-Wertungen nach Bedarf an.
3.  **Charaktere definieren**: Basierend auf dem Skript identifiziert die App Charaktere. Klicken Sie für jeden auf "Aussehen generieren", um eine konsistente visuelle Referenz zu erstellen. Sie können dies wiederholen, bis Sie zufrieden sind.
4.  **Comic generieren**: Sobald die Charaktere definiert sind, fahren Sie fort, um die vollständige Comic-Seite zu generieren. Dies umfasst das Erstellen eines Bildes für jedes Panel und deren Komposition.
5.  **Anpassen & Exportieren**: Verwenden Sie das schwebende Einstellungsfenster, um das endgültige Aussehen zu verfeinern. Wenn Sie fertig sind, verwenden Sie die Download-Schaltflächen, um Ihren Comic als CBZ- oder PDF-Datei zu speichern.

### 🏗️ Architekturkonzept

Der Kern von Comic-Gen PWA ist sein **hybrider KI-algorithmischer Ansatz**:

-   **KI für Kreativität**: Die Gemini API übernimmt Aufgaben, die Verständnis, Interpretation und Kreativität erfordern. Dazu gehören das Analysieren der Erzählung, das Zusammenfassen von Szenen und vor allem das Erstellen der eigentlichen Grafiken auf der Grundlage komplexer visueller Prompts.
-   **Algorithmen für Struktur**: D3.js übernimmt die deterministische und mathematische Aufgabe der Seitenkomposition. Durch die Verwendung von Treemaps übersetzt es die "Aktions-Wertung" jeder Szene in eine proportionale Panelgröße und ordnet sie gemäß einem ausgewählten Algorithmus auf der Seite an. Dies gewährleistet ein gut strukturiertes und visuell ausgewogenes Ergebnis, das die KI allein möglicherweise nicht konsistent erzeugen könnte.

Diese Arbeitsteilung nutzt die Stärken beider Bereiche, um eine leistungsstarke und flexible Generierungs-Engine zu schaffen.
