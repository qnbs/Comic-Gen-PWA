import React from 'react';
import { useAppSelector } from '../../app/hooks';
import BookCard from './BookCard';
import { useTranslation } from '../../hooks/useTranslation';
import { LibraryIcon } from '../Icons';

const MyBooksTab: React.FC = () => {
    const { t } = useTranslation();
    const { localBooks, status } = useAppSelector((state) => state.libraryBrowser);

    const renderGrid = () => {
        if (status === 'loading') {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mt-2 w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mt-1 w-1/2"></div>
                    </div>
                ))}
                </div>
            );
        }

        if (localBooks.length === 0) {
            return (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12 flex flex-col items-center">
                    <LibraryIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h4 className="font-semibold text-lg">{t('importer.emptyLibrary')}</h4>
                    <p className="max-w-xs">{t('importer.emptyLibraryDesc')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {localBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
        );
    }
    
    return (
        <div>
            {renderGrid()}
        </div>
    );
};

export default MyBooksTab;
