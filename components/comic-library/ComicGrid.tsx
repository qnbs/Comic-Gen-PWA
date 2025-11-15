import React from 'react';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import ComicCard from './ComicCard';
import { StoredComic } from '../../types';

interface ComicGridProps {
    onLoadComic: (comic: StoredComic) => void;
}

const ComicGrid: React.FC<ComicGridProps> = ({ onLoadComic }) => {
    const { filteredAndSortedComics } = useComicLibraryContext();

    return (
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[65vh] overflow-y-auto pr-2 pb-4">
            {filteredAndSortedComics.map(comic => (
                <ComicCard key={comic.id} comic={comic} onLoadComic={onLoadComic} />
            ))}
        </div>
    );
};

export default ComicGrid;
