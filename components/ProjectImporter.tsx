import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createProject } from '../features/generationSlice';
import LibraryBrowser from './importer/LibraryBrowser';
import FileUpload from './importer/FileUpload';
import PasteText from './importer/PasteText';

type ImportTab = 'library' | 'upload' | 'paste';

const TabButton: React.FC<{
  tabId: ImportTab;
  activeTab: ImportTab;
  onClick: (tabId: ImportTab) => void;
  label: string;
}> = ({ tabId, activeTab, onClick, label }) => {
  return (
    <button
      onClick={() => onClick(tabId)}
      className={`flex-1 py-3 font-semibold transition-colors text-sm sm:text-base ${
        activeTab === tabId
          ? 'text-indigo-600 dark:text-indigo-300 border-b-2 border-indigo-600'
          : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400'
      }`}
    >
      {label}
    </button>
  );
};

const ProjectImporter: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<ImportTab>('library');
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.ui);

  const handleSubmit = React.useCallback(() => {
    if (!text.trim() || !title.trim()) {
      setError('Please provide a title and text content.');
      return;
    }
    dispatch(createProject({ text, title, language }));
  }, [text, title, dispatch, language]);

  const handleDataExtracted = (data: { title: string; text: string; error?: string | null }) => {
      setTitle(data.title);
      setText(data.text);
      setError(data.error || null);
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 mb-6">
          Create New Comic Project
        </h2>

        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
          <TabButton tabId="library" activeTab={activeTab} onClick={setActiveTab} label={t('importer.tabBrowse')} />
          <TabButton tabId="upload" activeTab={activeTab} onClick={setActiveTab} label={t('importer.tabUpload')} />
          <TabButton tabId="paste" activeTab={activeTab} onClick={setActiveTab} label={t('importer.pastePlaceholder')} />
        </div>

        <div className="min-h-[400px]">
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
            Analyze & Create Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectImporter;
