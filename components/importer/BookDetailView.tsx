import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setSelectedBookId,
  deleteBookFromLibrary,
} from '../../features/gutenbergSlice';
import { createProject } from '../../features/projectSlice';
import { TrashIcon, WandIcon, BookOpenIcon, PencilIcon, SparklesIcon } from '../Icons';
import ConfirmDeleteBookModal from './ConfirmDeleteBookModal';
import { addToast } from '../../features/uiSlice';
import ReaderTab from './book-detail/ReaderTab';
import MetadataTab from './book-detail/MetadataTab';
import AnalysisTab from './book-detail/AnalysisTab';
import SaveStatusIndicator from './book-detail/SaveStatusIndicator';

type DetailTab = 'reader' | 'metadata' | 'analysis';

interface TabButtonProps {
    tabId: DetailTab;
    activeTab: DetailTab;
    onClick: (tabId: DetailTab) => void;
    label: string;
    icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ tabId, activeTab, onClick, label, icon }) => (
    <button
        onClick={() => onClick(tabId)}
        className={`flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors ${
        activeTab === tabId
            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-300'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
    >
        {icon}
        {label}
    </button>
);


const BookDetailView: React.FC<{ bookId: string }> = ({ bookId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { localBooks, status } = useAppSelector((state) => state.libraryBrowser);
  const { language } = useAppSelector((state) => state.ui);
  const book = localBooks.find((b) => b.id === bookId);

  const [activeTab, setActiveTab] = useState<DetailTab>('reader');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordToHighlight, setWordToHighlight] = useState<string>('');

  const handleBack = () => dispatch(setSelectedBookId(null));

  const handleWordClick = (word: string) => {
    setWordToHighlight(word);
    setActiveTab('reader');
  };

  const handleGenerateComic = () =>
    dispatch(
      createProject({
        text: book!.fullText!,
        title: book!.title,
        language,
      }),
    );

  const handleDeleteConfirm = () => {
    dispatch(deleteBookFromLibrary(bookId))
      .unwrap()
      .then(() => {
        dispatch(
          addToast({ message: `Book removed from your library.`, type: 'success' }),
        );
        setIsDeleting(false);
      })
      .catch((error: unknown) => {
        dispatch(addToast({ message: String(error), type: 'error' }));
        setIsDeleting(false);
      });
  };

  if (status === 'loading' && !book) return <div>Loading book...</div>;
  if (!book)
    return (
      <div>
        Book not found.{' '}
        <button onClick={handleBack} className="text-indigo-500 hover:underline">
          Go back.
        </button>
      </div>
    );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'metadata':
        return <MetadataTab book={book} />;
      case 'analysis':
        return <AnalysisTab book={book} onWordClick={handleWordClick} />;
      case 'reader':
      default:
        return (
          <ReaderTab
            book={book}
            wordToHighlight={wordToHighlight}
            clearHighlight={() => setWordToHighlight('')}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleBack}
        className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:underline"
      >
        &larr; {t('bookDetail.backToLibrary')}
      </button>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('importer.by')} {book.author}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setIsDeleting(true)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleGenerateComic}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <WandIcon className="w-5 h-5" />
            {t('importer.generate')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700">
        <div className="flex">
          <TabButton
            tabId="reader"
            activeTab={activeTab}
            onClick={setActiveTab}
            label={t('bookDetail.tabReader')}
            icon={<BookOpenIcon className="w-5 h-5" />}
          />
          <TabButton
            tabId="metadata"
            activeTab={activeTab}
            onClick={setActiveTab}
            label={t('bookDetail.tabMetadata')}
            icon={<PencilIcon className="w-5 h-5" />}
          />
           <TabButton
            tabId="analysis"
            activeTab={activeTab}
            onClick={setActiveTab}
            label={t('bookDetail.tabAnalysis')}
            icon={<SparklesIcon className="w-5 h-5" />}
          />
        </div>
        <SaveStatusIndicator />
      </div>

      <div className="py-4 min-h-[400px]">{renderTabContent()}</div>
      {isDeleting && (
        <ConfirmDeleteBookModal
          bookTitle={book.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleting(false)}
        />
      )}
    </div>
  );
};

export default BookDetailView;
