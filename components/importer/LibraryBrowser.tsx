import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchLocalBooks } from '../../features/gutenbergSlice';
import MyBooksTab from './MyBooksTab';
import OnlineLibraryBrowser from './OnlineLibraryBrowser';
import BookDetailView from './BookDetailView';
import { BookOpenIcon, SearchIcon } from '../Icons';

type LibraryTab = 'local' | 'online';

const TabButton: React.FC<{
  tabId: LibraryTab;
  activeTab: LibraryTab;
  onClick: (tabId: LibraryTab) => void;
  label: string;
  icon: React.ReactNode;
}> = ({ tabId, activeTab, onClick, label, icon }) => (
  <button
    onClick={() => onClick(tabId)}
    className={`flex-1 py-3 font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 ${
      activeTab === tabId
        ? 'text-indigo-600 dark:text-indigo-300 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
        : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    {icon}
    {label}
  </button>
);


const LibraryBrowser: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, selectedBookId } = useAppSelector((state) => state.libraryBrowser);
  const [activeTab, setActiveTab] = useState<LibraryTab>('local');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLocalBooks());
    }
  }, [status, dispatch]);
  
  if (selectedBookId) {
    return <BookDetailView bookId={selectedBookId} />;
  }

  return (
    <div className="space-y-6">
       <div className="flex border-b border-gray-300 dark:border-gray-700">
            <TabButton 
                tabId="local" 
                activeTab={activeTab} 
                onClick={setActiveTab} 
                label={t('importer.myLibrary')} 
                icon={<BookOpenIcon className="w-5 h-5"/>}
            />
            <TabButton 
                tabId="online" 
                activeTab={activeTab} 
                onClick={setActiveTab} 
                label={t('importer.onlineSearch')} 
                icon={<SearchIcon className="w-5 h-5"/>}
            />
       </div>

       <div className="pt-2">
        {activeTab === 'local' && <MyBooksTab />}
        {activeTab === 'online' && <OnlineLibraryBrowser />}
       </div>
    </div>
  );
};

export default LibraryBrowser;