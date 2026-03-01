# Copilot Instructions for Comic-Gen-PWA

## Big picture (read this first)
- This app is a client-side React 19 + Redux Toolkit PWA for turning text into comics; core orchestration is in `features/` + `components/workspace/`.
- The `project` reducer is wrapped with `redux-undo`; most selectors/actions must read/write via `state.project.present` (see `app/store.ts`).
- Scene data is normalized into `entities.scenes` while chapters store scene IDs (normalization in `features/projectSlice.ts`).
- AI + deterministic layout are intentionally split: Gemini handles text/image/video/audio (`services/geminiService.ts`), D3 handles panel/bubble layout (`features/pageThunks.ts`, `services/speechBubbleWorker.ts`).

## State and data flow conventions
- Prefer `createAsyncThunk` in slices/thunk files (`projectSlice.ts`, `pageThunks.ts`, `worldThunks.ts`, `gutenbergSlice.ts`) and keep side effects there.
- Autosave is middleware-driven (`app/autoSaveMiddleware.ts`): only `project/`, `world/`, `page/` actions trigger debounced saves; avoid duplicating save calls in components.
- Persistence is split by purpose:
  - IndexedDB (`services/db.ts`) for projects, pages, blobs, presets, local books.
  - `localStorage` for settings/theme/language/onboarding (`settingsSlice.ts`, `uiSlice.ts`, middleware).
- Media references are IDs (`media-*`) stored in panels/world assets; always save/delete blobs via DB helpers to avoid orphaned media.

## Service boundaries and integration points
- Gemini calls must go through `makeApiRequest` in `services/geminiService.ts` to keep retry/backoff/cooldown/friendly-error behavior consistent.
- Online book search is fault-tolerant by design: `services/bookSearchService.ts` uses `Promise.allSettled`; partial source failures should not fail the entire query.
- Gutenberg/OpenLibrary text fetches use robust/fallback logic (`services/gutendexService.ts`, `services/openLibraryService.ts`, `services/utils.ts`); reuse these helpers instead of raw `fetch`.
- Export flows (PDF/CBZ/JSON) are centralized in `services/exportService.ts`; UI triggers via async thunks in `features/uiSlice.ts`.

## UI architecture patterns
- Top-level routing is store-driven (`ui.currentPage`) in `App.tsx`, not React Router.
- Creator lifecycle is state-machine-like via `ProjectGenerationState` in `components/CreatorWorkspace.tsx`.
- Main editor surface is context-driven by `project.activeContext` in `components/MainWorkspace.tsx`.
- Many complex components use local provider+hook composition (`ProjectImporter.tsx`, `ComicViewer.tsx`); follow this pattern before introducing new global state.
- i18n goes through `LanguageContext` + `useTranslation`; add keys in `services/translations.ts` and use `t('...')`, never inline UI strings for new features.

## Dev workflows (repo-specific)
- Install/run: `npm install`, `npm run dev` (Vite on port 3000, host `0.0.0.0` via `vite.config.ts`).
- Production build: `npm run build`; preview: `npm run preview`.
- No dedicated test/lint scripts are currently defined in `package.json`; validate changes with targeted manual flows in the affected workspace views.
- Gemini API key is user-provided at runtime in Settings and stored encrypted in IndexedDB (`services/secureKeyStore.ts`); do not add build-time API key injection.

## PWA and performance-sensitive areas
- Service worker caching is manually configured in `sw.js` (Workbox CDN import); keep cache strategy changes minimal and explicit.
- Speech bubble physics has two implementations:
  - Worker runtime placement (`services/speechBubbleWorker.ts`) for interactive UI.
  - Export-time placement in `services/exportService.ts` for PDF/CBZ rendering.
  Keep both behaviors aligned when changing bubble algorithms.

## Safe change checklist for agents
- When touching `project` state, verify both reducer logic and UI reads use `present` state shape.
- When adding async generation actions, consider undo filtering in `app/store.ts` (`excludeAction`) to avoid history noise.
- When adding new persisted fields, update both save/load paths in `services/db.ts` and any import/export shape in `features/librarySlice.ts` + `services/exportService.ts`.