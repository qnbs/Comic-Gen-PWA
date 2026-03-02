import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createProject } from '../features/projectSlice';
import { setCurrentPage } from '../features/uiSlice';
import LibraryBrowser from './importer/LibraryBrowser';
import FileUpload from './importer/FileUpload';
import PasteText from './importer/PasteText';
import LanguageSelector from './LanguageSelector';
import { LibraryIcon, UploadCloudIcon, ClipboardIcon, CogIcon, HelpCircleIcon } from './Icons';

type ImportTab = 'library' | 'upload' | 'paste';

// --- Hook and Context for Component Logic ---

interface ProjectImporterContextType {
  activeTab: ImportTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ImportTab>>;
  text: string;
  title: string;
  error: string | null;
  handleDataExtracted: (data: { title: string; text: string; error?: string | null }) => void;
  handleSubmit: () => void;
}

const ProjectImporterContext = React.createContext<ProjectImporterContextType | undefined>(undefined);

const useProjectImporterContext = () => {
  const context = React.useContext(ProjectImporterContext);
  if (!context) {
    throw new Error('useProjectImporterContext must be used within a ProjectImporterProvider');
  }
  return context;
};

const useProjectImporter = () => {
  const [activeTab, setActiveTab] = React.useState<ImportTab>('library');
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);

  const handleSubmit = React.useCallback(() => {
    if (!text.trim() || !title.trim()) {
      setError(t('importer.missingTitleAndText'));
      return;
    }
    dispatch(createProject({ text, title, language }));
  }, [text, title, dispatch, language, t]);

  const handleDataExtracted = React.useCallback((data: { title: string; text: string; error?: string | null }) => {
    setTitle(data.title);
    setText(data.text);
    setError(data.error || null);
  }, []);

  return { activeTab, setActiveTab, text, title, error, handleDataExtracted, handleSubmit };
};

// --- UI Components ---

const TabButton: React.FC<{ tabId: ImportTab; label: string; icon: React.ReactNode }> = ({ tabId, label, icon }) => {
  const { activeTab, setActiveTab } = useProjectImporterContext();
  return (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 py-3 px-2 sm:px-4 font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 ${
        activeTab === tabId
          ? 'text-indigo-600 dark:text-indigo-300 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
          : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const ProjectImporterContent: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { activeTab, text, title, error, handleDataExtracted, handleSubmit } = useProjectImporterContext();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl overflow-hidden">
      <div className="p-0 relative">
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setCurrentPage('settings'))}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('settingsPage.openSettings')}
              title={t('settingsPage.openSettings')}
            >
              <CogIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setCurrentPage('help'))}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
              aria-label={t('settingsPage.openHelp')}
              title={t('settingsPage.openHelp')}
            >
              <HelpCircleIcon className="w-4 h-4" />
            </button>
            <LanguageSelector />
          </div>
        </div>
        <div className="pt-8 px-8 pb-2">
             <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 mb-2">
            {t('importer.createProjectTitle')}
            </h2>
        </div>
       
        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 mt-4">
          <TabButton tabId="library" label={t('importer.tabBrowse')} icon={<LibraryIcon className="w-5 h-5"/>} />
          <TabButton tabId="upload" label={t('importer.tabUpload')} icon={<UploadCloudIcon className="w-5 h-5"/>} />
          <TabButton tabId="paste" label={t('importer.pastePlaceholder')} icon={<ClipboardIcon className="w-5 h-5"/>} />
        </div>
        <div className="min-h-[400px] px-8 pb-8">
          {activeTab === 'library' && <LibraryBrowser />}
          {activeTab === 'upload' && <FileUpload onDataExtracted={handleDataExtracted} />}
          {activeTab === 'paste' && <PasteText onDataChange={handleDataExtracted} />}
        </div>
      </div>
      {activeTab !== 'library' && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          {error && <p className="text-red-500 dark:text-red-400 text-center mb-4">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || !title.trim()}
            className="w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('importer.analyzeCreateProject')}
          </button>
        </div>
      )}
    </div>
  );
};

const ProjectImporterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useProjectImporter();
  return <ProjectImporterContext.Provider value={value}>{children}</ProjectImporterContext.Provider>;
};

const ProjectImporter: React.FC = () => {
  return (
    <ProjectImporterProvider>
      <ProjectImporterContent />
    </ProjectImporterProvider>
  );
};

export default ProjectImporter;