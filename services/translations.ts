const en = {
  app: {
    subtitle:
      'Transforming narratives into visual epics. Upload your e-book text to begin.',
    footer: 'Built with React, Tailwind CSS, and the power of Gemini.',
    resume: {
      title: 'Resume Session?',
      body: 'You have saved progress from {{date}}. Would you like to continue?',
      resumeButton: 'Resume',
      discardButton: 'Discard & Start New',
      discardConfirmation:
        'Are you sure you want to discard this session? All unsaved progress will be lost.',
    },
  },
  importer: {
    tabBrowse: 'Browse Library',
    tabUrl: 'Import from URL',
    tabUpload: 'Upload File',
    dragAndDrop: 'Drag & drop your .txt file here',
    uploadHint: 'or click to select (Max 50KB)',
    uploadError: 'Please upload a .txt file smaller than 50KB.',
    selectFileError: 'Please select a file first.',
    readFileError: 'Failed to read the file.',
    urlDescription:
      'Find a public domain book online (e.g., from Project Gutenberg), copy the text, and paste it below.',
    pastePlaceholder: 'Paste book text here...',
    browseDescription:
      'Start instantly with a classic from our curated public domain library.',
    by: 'by',
    generate: 'Generate Comic',
  },
  creatorWorkspace: {
    stepImport: 'Import',
    stepScript: 'Script',
    stepCharacters: 'Characters',
    stepPage: 'Page',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
  },
  loader: {
    segmentingScenes: 'Segmenting Scenes...',
    segmentingScenesDesc:
      'The AI is splitting the story into distinct narrative scenes.',
    analyzingText: 'Analyzing Scenes...',
    analyzingTextDesc:
      'The AI is reading each scene, identifying characters, actions, and writing visual prompts.',
    generatingImages: 'Painting Panels...',
    generatingImagesDesc:
      'Our digital artist is bringing each scene to life. This may take a moment.',
    composingPage: 'Composing Page...',
    composingPageDesc:
      'Arranging panels and adding dialogue to create the final comic page.',
    loading: 'Loading...',
    pleaseWait: 'Please wait.',
  },
  scene: {
    reviewTitle: 'Review Your Comic Script',
    reviewSubtitle:
      "Fine-tune the AI's understanding of each scene before generating images. Your changes here directly impact the final art.",
    title: 'Scene {{index}}',
    summary: 'Summary',
    dialogue: 'Dialogue',
    characters: 'Characters',
    actionScore: 'Action Score (Panel Size)',
    visualPrompt: 'Visual Prompt',
    continueToCharacter: 'Continue to Character Definition',
  },
  character: {
    defineTitle: 'Define Your Characters',
    defineSubtitle:
      'Generate a consistent appearance for each character before creating the comic.',
    referenceFor: 'Reference for',
    descriptionFor: 'Description for',
    descriptionPlaceholder:
      'Enter a detailed visual description for this character...',
    noImage: 'No Image',
    generateAppearance: 'Generate Appearance',
    noneDetected: 'No characters were detected in this text segment.',
    proceed: 'Proceed to Generate Comic',
  },
  comic: {
    titlePrefix: 'Comic from',
    mobileHint:
      'This is a large format. Please use two fingers to pinch and zoom.',
    download: 'Download CBZ',
    exportPdf: 'Export as PDF',
    exportZip: 'Export Panels (ZIP)',
    createNew: 'Create New Comic',
    panelAlt: 'A comic panel illustrating a scene.',
    panelAltWithDialogue: 'Comic panel with dialogue',
    regeneratePanelAria: 'Regenerate Panel',
  },
  regenerateModal: {
    title: 'Regenerate Panel',
    promptLabel: 'Visual Prompt',
    generateButton: 'Generate',
    generatingButton: 'Generating...',
  },
  comicLibrary: {
    title: 'My Comic Library',
    emptyTitle: 'Your Library is Empty',
    emptyBody:
      "You haven't saved any comics yet. Let's create your first masterpiece!",
    emptyAction: 'Create a New Comic',
    load: 'Load',
    delete: 'Delete',
    searchPlaceholder: 'Search by title...',
    sortBy: 'Sort by',
    sortDateNewest: 'Date (Newest)',
    sortDateOldest: 'Date (Oldest)',
    sortTitleAZ: 'Title (A-Z)',
    deleteSelected: 'Delete Selected',
    selectedCount: '{{count}} selected',
    deleteConfirmTitle: 'Confirm Deletion',
    deleteConfirmBody:
      "Are you sure you want to permanently delete '{{title}}'?",
    deleteMultipleConfirmBody:
      'Are you sure you want to permanently delete these {{count}} comics? This action cannot be undone.',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  settings: {
    title: 'Comic Settings',
    showSpeechBubbles: 'Show Speech Bubbles',
    bubbleFontSize: 'Bubble Font Size',
    bubbleFont: 'Bubble Font',
    fontBangers: 'Bangers (Comic)',
    bubbleStyle: 'Bubble Style',
    styleRounded: 'Rounded',
    styleSharp: 'Sharp',
    styleCloud: 'Cloud',
    panelLayout: 'Panel Layout',
    layoutSquarified: 'Balanced',
    layoutStrip: 'Ordered',
    layoutBinary: 'Dynamic',
    layoutGrid: 'Grid',
    layoutColumn: 'Column',
    imageQuality: 'Image Quality',
    qualityLow: 'Low',
    qualityMedium: 'Medium',
    qualityHigh: 'High',
    artStyle: 'Art Style',
    styleDefault: '90s Comic',
    styleManga: 'Manga',
    styleNoir: 'Noir',
    styleWatercolor: 'Watercolor',
    styleCyberpunk: 'Cyberpunk',
    negativePrompt: 'Negative Prompt',
    negativePromptPlaceholder: 'e.g., text, blurry, watermark',
    aspectRatio: 'Panel Aspect Ratio',
    gutterWidth: 'Gutter Width',
    pageBorder: 'Page Border',
    borderColor: 'Border Color',
    localStorage: 'Local Storage',
    used: 'used',
    storageWarning:
      'Warning: Storage is nearly full. You may not be able to save new comics.',
  },
  settingsPage: {
    title: 'App Settings',
    tabGeneration: 'Generation',
    tabGeneral: 'General',
    tabData: 'Data',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    manageSettings: 'Manage Settings',
    exportButton: 'Export',
    importButton: 'Import',
    importError: 'Failed to import settings. The file might be corrupt.',
    sessionManagement: 'Session Management',
    clearSession: 'Clear In-Progress Session',
    clearSessionDescription:
      'This will discard your current work-in-progress (from the Scene Review or Character Definition stage).',
    clearSessionConfirmation:
      'Are you sure you want to discard your current session?',
    dataManagement: 'Danger Zone',
    clearData: 'Clear All Saved Comics',
    clearDataDescription:
      'This will permanently delete all saved comics from your library. This action cannot be undone.',
    clearDataConfirmation:
      'Are you sure you want to delete all data? This cannot be undone.',
    backButton: 'Back to Creator',
  },
  helpPage: {
    title: 'Help & Information',
    backButton: 'Back to Creator',
    introduction: {
      title: 'Introduction',
      body: "Welcome to Comic-Gen PWA, a state-of-the-art tool designed to transform written narratives into visually stunning comic book pages. This application employs a sophisticated hybrid AI-algorithmic approach: it uses the creative power of Google's Gemini models for narrative interpretation and image generation, combined with deterministic algorithms for precise page layout and composition. This guide will walk you through mastering its features to bring your stories to life.",
    },
    workflow: {
      title: 'The Creative Workflow',
      step1: {
        title: '1. Provide Your Text',
        body: 'Your journey begins with the text. You can select a public domain classic, paste text from an online source, or upload your own .txt file. For best results, use narrative text with clear actions, descriptions, and characters. The AI will segment this text into a maximum of 6-8 key scenes to fit onto a single comic page.',
      },
      step2: {
        title: '2. Script Review & Refinement',
        body: "This is the most critical step for creative control. The AI presents a 'comic script' where it has interpreted each scene. Here you can edit the Visual Prompt, which is the direct instruction for the image generation AI. Be specific! You can also adjust the Action Score, which influences the final size of the panel—higher scores mean larger, more important panels.",
      },
      step3: {
        title: '3. Character Definition',
        body: "To combat the common AI issue of inconsistent character appearances, this step allows you to create a visual baseline. For each character detected, you can generate a reference image and a detailed description. This 'character sheet' is then fed back into the AI for all subsequent image generations, drastically improving visual consistency across panels.",
      },
      step4: {
        title: '4. Generation & Export',
        body: 'With your script and characters finalized, the engine generates all panel images and composes them onto the page using your selected layout algorithm. The final high-resolution comic page can then be customized with various settings and exported in multiple formats, including CBZ for comic readers, PDF for universal viewing, or a ZIP of individual panel images.',
      },
    },
    settings: {
      title: 'Settings Deep Dive',
      generation: {
        title: 'Generation Defaults',
        body: "Control the core artistic output. Art Style applies a consistent aesthetic (e.g., Manga, Noir). Image Quality adjusts detail and generation time. Aspect Ratio sets the shape of each panel, influencing the overall page composition. The Negative Prompt helps you exclude unwanted elements like text or watermarks from your images.",
      },
      layout: {
        title: 'Layout & Composition',
        body: "Define the structure of your page. The Panel Layout algorithm determines how panels are arranged: 'Balanced' for a classic grid-like feel, 'Ordered' for a sequential strip, and 'Dynamic' for a more varied, modern look. Gutter Width controls the spacing between panels, and the Page Border adds a professional-looking finish.",
      },
      bubbles: {
        title: 'Speech Bubbles',
        body: "Customize how dialogue is presented. You can toggle speech bubbles on or off, select a font that matches your comic's tone, and choose a visual style for the bubbles themselves, from classic rounded to sharp-edged or cloud-like.",
      },
    },
    tips: {
      title: 'Tips & Best Practices',
      tip1: {
        title: 'Master the Visual Prompt',
        body: "Your most powerful tool is the Visual Prompt editor in the Scene Review stage. Don't just accept the AI's first draft. Add specifics: camera angles ('low-angle shot'), lighting ('dramatic Rembrandt lighting'), character emotions ('a grim expression'), and setting details ('a cluttered, dusty library'). The more detail, the better the result.",
      },
      tip2: {
        title: 'Elaborate on Character Descriptions',
        body: "When defining characters, the AI-generated description is just a starting point. Edit it to be highly specific. Instead of 'a man in a coat', write 'a grizzled detective in a worn, brown trench coat, a fedora casting a shadow over his tired eyes'. This detail is key to consistency.",
      },
      tip3: {
        title: 'Use Action Scores Intentionally',
        body: "The Action Score directly translates to panel size. Use it to control the narrative rhythm. A quiet, establishing shot might be a 3 or 4, while the climactic action or a shocking reveal should be a 9 or 10 to dominate the page and draw the reader's eye.",
      },
      tip4: {
        title: 'Iterate and Experiment',
        body: "Don't be afraid to try different settings. A story told in the 'Noir' style will feel completely different from the same story in 'Watercolor'. Experiment with different layout algorithms and aspect ratios to see how they change the flow and feel of your comic.",
      },
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'Why did my comic generation fail?',
      a1: 'Generation can fail for several reasons: network issues, an overloaded AI service, or prompts that violate safety policies. The most common fix is to simplify your visual prompts, remove potentially ambiguous language, and try again.',
      q2: 'Why do my characters look different in every panel?',
      a2: "This is a common challenge with AI image generation. The 'Character Definition' step is designed to minimize this. For best results, provide a very detailed text description for each character and re-generate their reference image until you have one that captures their essence well. This detailed reference is crucial for consistency.",
      q3: 'What are the limitations?',
      a3: "The app is optimized for short text excerpts (up to 50KB) to generate a single, dense comic page. It's a creative tool that may interpret text in unexpected ways. The AI's ability to maintain perfect consistency, especially with fine details, is still evolving.",
      q4: 'What do all the settings in the Settings Page do?',
      a4: "The settings provide deep control over the final output. They are grouped into 'Generation' (affecting the art itself), 'General' (affecting the user interface and speech bubbles), and 'Data' (for managing your saved settings and comics). Refer to the 'Settings Deep Dive' section above for a detailed explanation of each option.",
    },
    technical: {
      title: 'Technical Snapshot',
      body: "Comic-Gen PWA is built with React and leverages the Google Gemini API. Specifically, it uses the 'gemini-2.5-pro' model for advanced text analysis and scripting, and the 'imagen-4.0-generate-001' model for high-quality image generation. Page composition is handled client-side by the powerful D3.js library, which creates the treemap-based panel layouts. All user data, including saved comics and session progress, is stored locally in your browser using IndexedDB.",
    },
  },
  common: {
    tryAgain: 'Try Again',
    generating: 'Generating...',
    none: 'None',
    undo: 'Undo',
    redo: 'Redo',
    edit: 'Edit',
    enabled: 'Enabled',
  },
  error: {
    noScenesExtracted: 'Could not extract any scenes from the text.',
    unknownAnalysis: 'An unknown error occurred during text analysis.',
    unknownGeneration: 'An unknown error occurred during comic generation.',
    downloadFailed: 'Could not create the comic file for download.',
    pdfExportFailed: 'Could not create the PDF file for export.',
    somethingWentWrong: 'Something went wrong.',
    generationFailed: 'Generation Failed',
    generateSheetFailed: 'Failed to generate sheet.',
  },
  gemini: {
    characterReference: 'CHARACTER REFERENCE',
    characterAdherence:
      'Ensure the characters strictly adhere to these descriptions.',
    sceneSegmentationPreamble:
      'Given the following text, break it down into distinct narrative scenes. Return a JSON array of strings, where each string is the complete text for one scene. A scene is defined by a continuous block of action or dialogue in one location. Do not summarize or change the text, just segment it. Maximum of 6 scenes.',
    sceneAnalysisPreamble:
      'Here is a single scene from a story. Process this text and return a JSON object for this scene, which must contain:',
    originalTextPrompt: 'The exact text segment for this scene.',
    summaryPrompt: 'A one-sentence summary of the scene.',
    charactersPrompt: 'An array of all character names present in the scene.',
    dialoguePrompt:
      'A string containing only the spoken dialogue from the scene, formatted nicely. If no dialogue, return an empty string.',
    visualPromptPrompt: `A highly detailed visual prompt for an image generation AI. Describe the setting, characters' poses, actions, mood, lighting, and camera angle. Do NOT include style information like 'in the style of...'. Focus only on the content of the scene. Explicitly describe character appearances based on the text.`,
    actionScorePrompt:
      'An integer from 1 (a quiet, static scene) to 10 (a major action sequence or dramatic reveal). This score determines the panel size.',
    characterDescriptionPrompt: `Based on the following text, create a concise but detailed visual description of the character "{{characterName}}". Focus on physical traits, clothing, hair, and any defining features mentioned. This description will be used to ensure visual consistency in an AI image generator. Output only the description string.`,
  },
};

const de: typeof en = {
  app: {
    subtitle:
      'Verwandeln Sie Erzählungen in visuelle Epen. Laden Sie Ihren E-Book-Text hoch, um zu beginnen.',
    footer: 'Erstellt mit React, Tailwind CSS und der Power von Gemini.',
    resume: {
      title: 'Sitzung fortsetzen?',
      body: 'Sie haben einen Speicherstand vom {{date}}. Möchten Sie fortfahren?',
      resumeButton: 'Fortsetzen',
      discardButton: 'Verwerfen & Neu starten',
      discardConfirmation:
        'Möchten Sie diese Sitzung wirklich verwerfen? Alle nicht gespeicherten Fortschritte gehen verloren.',
    },
  },
  importer: {
    tabBrowse: 'Bibliothek',
    tabUrl: 'Von URL importieren',
    tabUpload: 'Datei hochladen',
    dragAndDrop: 'Ziehen Sie Ihre .txt-Datei hierher',
    uploadHint: 'oder klicken Sie zum Auswählen (Max. 50KB)',
    uploadError: 'Bitte laden Sie eine .txt-Datei hoch, die kleiner als 50KB ist.',
    selectFileError: 'Bitte wählen Sie zuerst eine Datei aus.',
    readFileError: 'Die Datei konnte nicht gelesen werden.',
    urlDescription:
      'Finden Sie ein gemeinfreies Buch online (z.B. von Project Gutenberg), kopieren Sie den Text und fügen Sie ihn unten ein.',
    pastePlaceholder: 'Fügen Sie hier den Buchtext ein...',
    browseDescription:
      'Starten Sie sofort mit einem Klassiker aus unserer kuratierten gemeinfreien Bibliothek.',
    by: 'von',
    generate: 'Comic generieren',
  },
  creatorWorkspace: {
    stepImport: 'Import',
    stepScript: 'Skript',
    stepCharacters: 'Charaktere',
    stepPage: 'Seite',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
  },
  loader: {
    segmentingScenes: 'Szenen werden segmentiert...',
    segmentingScenesDesc:
      'Die KI teilt die Geschichte in einzelne erzählerische Szenen auf.',
    analyzingText: 'Szenen werden analysiert...',
    analyzingTextDesc:
      'Die KI liest jede Szene, identifiziert Charaktere, Handlungen und schreibt visuelle Anweisungen.',
    generatingImages: 'Zeichne Panels...',
    generatingImagesDesc:
      'Unser digitaler Künstler erweckt jede Szene zum Leben. Dies kann einen Moment dauern.',
    composingPage: 'Seite wird erstellt...',
    composingPageDesc:
      'Die Panels werden angeordnet und Dialoge hinzugefügt, um die finale Comic-Seite zu erstellen.',
    loading: 'Wird geladen...',
    pleaseWait: 'Bitte warten.',
  },
  scene: {
    reviewTitle: 'Überprüfen Sie Ihr Comic-Skript',
    reviewSubtitle:
      'Passen Sie das Verständnis der KI für jede Szene an, bevor die Bilder generiert werden. Ihre Änderungen hier beeinflussen direkt die finale Grafik.',
    title: 'Szene {{index}}',
    summary: 'Zusammenfassung',
    dialogue: 'Dialog',
    characters: 'Charaktere',
    actionScore: 'Aktions-Wertung (Panel-Größe)',
    visualPrompt: 'Visueller Prompt',
    continueToCharacter: 'Weiter zur Charakter-Definition',
  },
  character: {
    defineTitle: 'Definieren Sie Ihre Charaktere',
    defineSubtitle:
      'Generieren Sie ein konsistentes Aussehen für jeden Charakter, bevor Sie den Comic erstellen.',
    referenceFor: 'Referenz für',
    descriptionFor: 'Beschreibung für',
    descriptionPlaceholder:
      'Geben Sie eine detaillierte visuelle Beschreibung für diesen Charakter ein...',
    noImage: 'Kein Bild',
    generateAppearance: 'Aussehen generieren',
    noneDetected: 'In diesem Textabschnitt wurden keine Charaktere erkannt.',
    proceed: 'Weiter zur Comic-Generierung',
  },
  comic: {
    titlePrefix: 'Comic vom',
    mobileHint: 'Dies ist ein großes Format. Bitte benutzen Sie zwei Finger zum Zoomen.',
    download: 'CBZ herunterladen',
    exportPdf: 'Als PDF exportieren',
    exportZip: 'Panels exportieren (ZIP)',
    createNew: 'Neuen Comic erstellen',
    panelAlt: 'Ein Comic-Panel, das eine Szene illustriert.',
    panelAltWithDialogue: 'Comic-Panel mit Dialog',
    regeneratePanelAria: 'Panel neu generieren',
  },
  regenerateModal: {
    title: 'Panel neu generieren',
    promptLabel: 'Visueller Prompt',
    generateButton: 'Generieren',
    generatingButton: 'Generiere...',
  },
  comicLibrary: {
    title: 'Meine Comic-Bibliothek',
    emptyTitle: 'Ihre Bibliothek ist leer',
    emptyBody:
      'Sie haben noch keine Comics gespeichert. Erstellen Sie jetzt Ihr erstes Meisterwerk!',
    emptyAction: 'Neuen Comic erstellen',
    load: 'Laden',
    delete: 'Löschen',
    searchPlaceholder: 'Nach Titel suchen...',
    sortBy: 'Sortieren nach',
    sortDateNewest: 'Datum (Neueste)',
    sortDateOldest: 'Datum (Älteste)',
    sortTitleAZ: 'Titel (A-Z)',
    deleteSelected: 'Auswahl löschen',
    selectedCount: '{{count}} ausgewählt',
    deleteConfirmTitle: 'Löschen bestätigen',
    deleteConfirmBody: "Möchten Sie '{{title}}' wirklich dauerhaft löschen?",
    deleteMultipleConfirmBody:
      'Möchten Sie diese {{count}} Comics wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    confirm: 'Bestätigen',
    cancel: 'Abbrechen',
  },
  settings: {
    title: 'Comic-Einstellungen',
    showSpeechBubbles: 'Sprechblasen anzeigen',
    bubbleFontSize: 'Schriftgröße der Blasen',
    bubbleFont: 'Schriftart der Blasen',
    fontBangers: 'Bangers (Comic)',
    bubbleStyle: 'Sprechblasen-Stil',
    styleRounded: 'Abgerundet',
    styleSharp: 'Scharf',
    styleCloud: 'Wolke',
    panelLayout: 'Panel-Layout',
    layoutSquarified: 'Ausgeglichen',
    layoutStrip: 'Geordnet',
    layoutBinary: 'Dynamisch',
    layoutGrid: 'Gitter',
    layoutColumn: 'Spalte',
    imageQuality: 'Bildqualität',
    qualityLow: 'Niedrig',
    qualityMedium: 'Mittel',
    qualityHigh: 'Hoch',
    artStyle: 'Kunststil',
    styleDefault: '90er Comic',
    styleManga: 'Manga',
    styleNoir: 'Noir',
    styleWatercolor: 'Aquarell',
    styleCyberpunk: 'Cyberpunk',
    negativePrompt: 'Negativer Prompt',
    negativePromptPlaceholder: 'z.B. Text, unscharf, Wasserzeichen',
    aspectRatio: 'Panel-Seitenverhältnis',
    gutterWidth: 'Panel-Abstand',
    pageBorder: 'Seitenrand',
    borderColor: 'Randfarbe',
    localStorage: 'Lokaler Speicher',
    used: 'verwendet',
    storageWarning:
      'Warnung: Der Speicher ist fast voll. Sie können möglicherweise keine neuen Comics speichern.',
  },
  settingsPage: {
    title: 'App-Einstellungen',
    tabGeneration: 'Generierung',
    tabGeneral: 'Allgemein',
    tabData: 'Daten',
    appearance: 'Erscheinungsbild',
    theme: 'Thema',
    light: 'Hell',
    dark: 'Dunkel',
    language: 'Sprache',
    manageSettings: 'Einstellungen verwalten',
    exportButton: 'Exportieren',
    importButton: 'Importieren',
    importError:
      'Import der Einstellungen fehlgeschlagen. Die Datei ist möglicherweise beschädigt.',
    sessionManagement: 'Sitzungsverwaltung',
    clearSession: 'Sitzung verwerfen',
    clearSessionDescription:
      'Dies verwirft Ihre aktuelle Arbeit (aus der Szenen- oder Charakter-Ansicht).',
    clearSessionConfirmation:
      'Sind Sie sicher, dass Sie Ihre aktuelle Sitzung verwerfen möchten?',
    dataManagement: 'Gefahrenzone',
    clearData: 'Alle Comics löschen',
    clearDataDescription:
      'Dies löscht dauerhaft alle gespeicherten Comics aus Ihrer Bibliothek. Diese Aktion kann nicht rückgängig gemacht werden.',
    clearDataConfirmation:
      'Sind Sie sicher, dass Sie alle Daten löschen möchten? Dies kann nicht rückgängig gemacht werden.',
    backButton: 'Zurück zum Editor',
  },
  helpPage: {
    title: 'Hilfe & Informationen',
    backButton: 'Zurück zum Editor',
    introduction: {
      title: 'Einführung',
      body: 'Willkommen bei Comic-Gen PWA, einem hochmodernen Werkzeug, das geschriebene Erzählungen in visuell beeindruckende Comicseiten umwandelt. Diese Anwendung nutzt einen anspruchsvollen hybriden KI-algorithmischen Ansatz: Sie verwendet die kreative Kraft von Googles Gemini-Modellen für die narrative Interpretation und Bilderzeugung, kombiniert mit deterministischen Algorithmen für präzises Seitenlayout und Komposition. Dieser Leitfaden führt Sie durch die Beherrschung seiner Funktionen, um Ihre Geschichten zum Leben zu erwecken.',
    },
    workflow: {
      title: 'Der kreative Arbeitsablauf',
      step1: {
        title: '1. Text bereitstellen',
        body: 'Ihre Reise beginnt mit dem Text. Sie können einen gemeinfreien Klassiker auswählen, Text aus einer Online-Quelle einfügen oder Ihre eigene .txt-Datei hochladen. Für beste Ergebnisse verwenden Sie erzählenden Text mit klaren Handlungen, Beschreibungen und Charakteren. Die KI segmentiert diesen Text in maximal 6-8 Schlüsselszenen, um auf eine einzige Comic-Seite zu passen.',
      },
      step2: {
        title: '2. Skript-Überprüfung & Verfeinerung',
        body: "Dies ist der entscheidendste Schritt für die kreative Kontrolle. Die KI präsentiert ein 'Comic-Skript', in dem sie jede Szene interpretiert hat. Hier können Sie den visuellen Prompt bearbeiten, der die direkte Anweisung für die Bilderzeugungs-KI ist. Seien Sie spezifisch! Sie können auch den Aktions-Wert anpassen, der die endgültige Größe des Panels beeinflusst – höhere Werte bedeuten größere, wichtigere Panels.",
      },
      step3: {
        title: '3. Charakter-Definition',
        body: 'Um das häufige KI-Problem inkonsistenter Charakterdarstellungen zu bekämpfen, ermöglicht dieser Schritt die Erstellung einer visuellen Grundlage. Für jeden erkannten Charakter können Sie ein Referenzbild und eine detaillierte Beschreibung generieren. Dieses \'Charakterblatt\' wird dann für alle nachfolgenden Bilderzeugungen an die KI zurückgespielt, was die visuelle Konsistenz über die Panels hinweg drastisch verbessert.',
      },
      step4: {
        title: '4. Generierung & Export',
        body: 'Nachdem Ihr Skript und Ihre Charaktere finalisiert sind, generiert die Engine alle Panel-Bilder und komponiert sie unter Verwendung des von Ihnen gewählten Layout-Algorithmus auf die Seite. Die endgültige hochauflösende Comic-Seite kann dann mit verschiedenen Einstellungen angepasst und in mehreren Formaten exportiert werden, darunter CBZ für Comic-Reader, PDF zur universellen Anzeige oder ein ZIP-Archiv mit einzelnen Panel-Bildern.',
      },
    },
    settings: {
      title: 'Einstellungen im Detail',
      generation: {
        title: 'Generierungs-Standards',
        body: "Steuern Sie die künstlerische Kernaussage. Der Kunststil wendet eine konsistente Ästhetik an (z. B. Manga, Noir). Die Bildqualität passt den Detailgrad und die Generierungszeit an. Das Seitenverhältnis legt die Form jedes Panels fest und beeinflusst die gesamte Seitenkomposition. Der negative Prompt hilft Ihnen, unerwünschte Elemente wie Text oder Wasserzeichen aus Ihren Bildern auszuschließen.",
      },
      layout: {
        title: 'Layout & Komposition',
        body: "Definieren Sie die Struktur Ihrer Seite. Der Panel-Layout-Algorithmus bestimmt, wie die Panels angeordnet werden: 'Ausgeglichen' für ein klassisches, gitterartiges Gefühl, 'Geordnet' für einen sequenziellen Streifen und 'Dynamisch' für einen abwechslungsreicheren, modernen Look. Der Panel-Abstand steuert den Abstand zwischen den Panels, und der Seitenrand fügt ein professionell aussehendes Finish hinzu.",
      },
      bubbles: {
        title: 'Sprechblasen',
        body: "Passen Sie an, wie Dialoge dargestellt werden. Sie können Sprechblasen ein- oder ausschalten, eine Schriftart auswählen, die zum Ton Ihres Comics passt, und einen visuellen Stil für die Blasen selbst wählen, von klassisch abgerundet über scharfkantig bis hin zu wolkenartig.",
      },
    },
    tips: {
      title: 'Tipps & bewährte Methoden',
      tip1: {
        title: 'Meistern Sie den visuellen Prompt',
        body: "Ihr mächtigstes Werkzeug ist der Editor für visuelle Prompts in der Phase der Szenenüberprüfung. Akzeptieren Sie nicht einfach den ersten Entwurf der KI. Fügen Sie Besonderheiten hinzu: Kamerawinkel ('Froschperspektive'), Beleuchtung ('dramatische Rembrandt-Beleuchtung'), Charakteremotionen ('ein grimmiger Ausdruck') und Umgebungsdetails ('eine unordentliche, staubige Bibliothek'). Je mehr Details, desto besser das Ergebnis.",
      },
      tip2: {
        title: 'Arbeiten Sie Charakterbeschreibungen aus',
        body: "Bei der Definition von Charakteren ist die KI-generierte Beschreibung nur ein Ausgangspunkt. Bearbeiten Sie sie, um sehr spezifisch zu sein. Anstelle von 'ein Mann in einem Mantel' schreiben Sie 'ein ergrauter Detektiv in einem abgenutzten, braunen Trenchcoat, ein Fedora wirft einen Schatten über seine müden Augen'. Dieses Detail ist der Schlüssel zur Konsistenz.",
      },
      tip3: {
        title: 'Setzen Sie Aktions-Werte gezielt ein',
        body: "Der Aktions-Wert übersetzt sich direkt in die Panelgröße. Nutzen Sie ihn, um den erzählerischen Rhythmus zu steuern. Eine ruhige, etablierende Aufnahme könnte eine 3 oder 4 sein, während die klimatische Handlung oder eine schockierende Enthüllung eine 9 oder 10 sein sollte, um die Seite zu dominieren und den Blick des Lesers zu fesseln.",
      },
      tip4: {
        title: 'Iterieren und Experimentieren',
        body: "Scheuen Sie sich nicht, verschiedene Einstellungen auszuprobieren. Eine Geschichte im 'Noir'-Stil wird sich völlig anders anfühlen als dieselbe Geschichte in 'Aquarell'. Experimentieren Sie mit verschiedenen Layout-Algorithmen und Seitenverhältnissen, um zu sehen, wie sie den Fluss und das Gefühl Ihres Comics verändern.",
      },
    },
    faq: {
      title: 'Häufig gestellte Fragen',
      q1: 'Warum ist meine Comic-Generierung fehlgeschlagen?',
      a1: 'Die Generierung kann aus mehreren Gründen fehlschlagen: Netzwerkprobleme, ein überlasteter KI-Dienst oder Prompts, die gegen Sicherheitsrichtlinien verstoßen. Die häufigste Lösung besteht darin, Ihre visuellen Prompts zu vereinfachen, potenziell mehrdeutige Sprache zu entfernen und es erneut zu versuchen.',
      q2: 'Warum sehen meine Charaktere in jedem Panel anders aus?',
      a2: "Dies ist eine häufige Herausforderung bei der KI-Bilderzeugung. Der Schritt 'Charakter-Definition' soll dies minimieren. Für beste Ergebnisse geben Sie eine sehr detaillierte Textbeschreibung für jeden Charakter an und generieren Sie deren Referenzbild neu, bis Sie eines haben, das ihre Essenz gut einfängt. Diese detaillierte Referenz ist entscheidend für die Konsistenz.",
      q3: 'Was sind die Einschränkungen?',
      a3: "Die App ist für kurze Textauszüge (bis zu 50 KB) optimiert, um eine einzelne, dichte Comic-Seite zu generieren. Es ist ein kreatives Werkzeug, das Text auf unerwartete Weise interpretieren kann. Die Fähigkeit der KI, perfekte Konsistenz, insbesondere bei feinen Details, aufrechtzuerhalten, entwickelt sich noch.",
      q4: 'Was bewirken all die Einstellungen auf der Einstellungsseite?',
      a4: "Die Einstellungen bieten eine umfassende Kontrolle über das Endergebnis. Sie sind in 'Generierung' (beeinflusst die Kunst selbst), 'Allgemein' (beeinflusst die Benutzeroberfläche und Sprechblasen) und 'Daten' (zur Verwaltung Ihrer gespeicherten Einstellungen und Comics) unterteilt. Beziehen Sie sich auf den Abschnitt 'Einstellungen im Detail' oben für eine detaillierte Erklärung jeder Option.",
    },
    technical: {
      title: 'Technischer Überblick',
      body: "Comic-Gen PWA wurde mit React erstellt und nutzt die Google Gemini API. Insbesondere verwendet es das 'gemini-2.5-pro'-Modell für fortgeschriebene Textanalyse und Skripterstellung und das 'imagen-4.0-generate-001'-Modell für hochwertige Bilderzeugung. Die Seitenkomposition wird clientseitig von der leistungsstarken D3.js-Bibliothek übernommen, die die auf Treemaps basierenden Panel-Layouts erstellt. Alle Benutzerdaten, einschließlich gespeicherter Comics und Sitzungsfortschritt, werden lokal in Ihrem Browser mithilfe von IndexedDB gespeichert.",
    },
  },
  common: {
    tryAgain: 'Erneut versuchen',
    generating: 'Wird generiert...',
    none: 'Keine',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    edit: 'Bearbeiten',
    enabled: 'Aktiviert',
  },
  error: {
    noScenesExtracted:
      'Es konnten keine Szenen aus dem Text extrahiert werden.',
    unknownAnalysis:
      'Während der Textanalyse ist ein unbekannter Fehler aufgetreten.',
    unknownGeneration:
      'Während der Comic-Generierung ist ein unbekannter Fehler aufgetreten.',
    downloadFailed:
      'Die Comic-Datei für den Download konnte nicht erstellt werden.',
    pdfExportFailed:
      'Die PDF-Datei für den Export konnte nicht erstellt werden.',
    somethingWentWrong: 'Etwas ist schiefgelaufen.',
    generationFailed: 'Generierung fehlgeschlagen',
    generateSheetFailed: 'Generierung des Charakterbogens fehlgeschlagen.',
  },
  gemini: {
    characterReference: 'CHARAKTERREFERENZ',
    characterAdherence:
      'Stellen Sie sicher, dass die Charaktere strikt diesen Beschreibungen entsprechen.',
    sceneSegmentationPreamble:
      'Gegeben ist der folgende Text. Teile ihn in einzelne erzählerische Szenen auf. Gib ein JSON-Array von Strings zurück, wobei jeder String der vollständige Text für eine Szene ist. Eine Szene ist durch einen zusammenhängenden Handlungs- oder Dialogblock an einem Ort definiert. Fasse den Text nicht zusammen oder verändere ihn, sondern segmentiere ihn nur. Maximal 6 Szenen.',
    sceneAnalysisPreamble:
      'Hier ist eine einzelne Szene aus einer Geschichte. Verarbeite diesen Text und gib ein JSON-Objekt für diese Szene zurück, das Folgendes enthalten muss:',
    originalTextPrompt: 'Der exakte Textabschnitt für diese Szene.',
    summaryPrompt: 'Eine ein-Satz-Zusammenfassung der Szene.',
    charactersPrompt:
      'Ein Array mit allen in der Szene vorkommenden Charakternamen.',
    dialoguePrompt:
      'Ein String, der nur den gesprochenen Dialog der Szene enthält, schön formatiert. Wenn kein Dialog vorhanden ist, geben Sie einen leeren String zurück.',
    visualPromptPrompt: `Ein sehr detaillierter visueller Prompt für eine Bilderzeugungs-KI. Beschreiben Sie die Umgebung, die Posen der Charaktere, Aktionen, Stimmung, Beleuchtung und den Kamerawinkel. Fügen Sie keine Stil-Informationen wie 'im Stil von...' hinzu. Konzentrieren Sie sich nur auf den Inhalt der Szene. Beschreiben Sie das Aussehen der Charaktere explizit basierend auf dem Text.`,
    actionScorePrompt:
      'Eine ganze Zahl von 1 (einer ruhigen, statischen Szene) bis 10 (einer großen Action-Sequenz oder dramatischen Enthüllung). Diese Wertung bestimmt die Panel-Größe.',
    characterDescriptionPrompt: `Basierend auf dem folgenden Text, erstelle eine prägnante, aber detaillierte visuelle Beschreibung des Charakters "{{characterName}}". Konzentriere dich auf physische Merkmale, Kleidung, Haare und alle erwähnten definierenden Merkmale. Diese Beschreibung wird verwendet, um die visuelle Konsistenz in einem KI-Bildgenerator zu gewährleisten. Gib nur den Beschreibungsstring aus.`,
  },
};

export const translations = { en, de };

// This utility type helps with type-checking keys for the t() function
type Path<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${'' | `.${Path<T[K]>}`}`;
    }[keyof T]
  : never;
export type TranslationKeys = Path<typeof en>;
export { en }; // Export 'en' for type inference
