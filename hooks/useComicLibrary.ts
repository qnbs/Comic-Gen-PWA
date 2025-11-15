import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  deleteComicFromLibrary,
  deleteMultipleComicsFromLibrary,
} from '../features/librarySlice';
import { selectFilteredAndSortedComics } from '../features/librarySelectors';
import type { StoredComic } from '../types';
import type { SortOption } from '../components/comic-library/types';
import { base64ToBlob } from '../services/utils';

export const useComicLibrary = () => {
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<SortOption>('date-desc');
  const [selectedComics, setSelectedComics] = React.useState<string[]>([]);
  const [comicToDelete, setComicToDelete] = React.useState<StoredComic | null>(
    null,
  );
  const [isBulkDelete, setIsBulkDelete] = React.useState(false);
  const [thumbnailUrls, setThumbnailUrls] = React.useState<
    Record<string, string>
  >({});
  const memoizedUrls = React.useRef<Record<string, string>>({});

  const filteredAndSortedComics = useAppSelector((state) =>
    selectFilteredAndSortedComics(state, searchQuery, sortOrder),
  );

  React.useEffect(() => {
    const newUrls: Record<string, string> = {};
    filteredAndSortedComics.forEach((comic) => {
      if (memoizedUrls.current[comic.id]) {
        newUrls[comic.id] = memoizedUrls.current[comic.id];
      } else if (comic.page?.panels?.[0]?.imageUrl) {
        const base64String = comic.page.panels[0].imageUrl.split(',')[1];
        if (base64String) {
          try {
            const blob = base64ToBlob(base64String);
            const url = URL.createObjectURL(blob);
            memoizedUrls.current[comic.id] = url;
            newUrls[comic.id] = url;
          } catch (e) {
            console.error(`Failed to create blob for comic ${comic.id}`, e);
          }
        }
      }
    });
    setThumbnailUrls(newUrls);

    // Main cleanup on unmount
    return () => {
      Object.values(memoizedUrls.current).forEach(URL.revokeObjectURL);
      memoizedUrls.current = {};
    };
  }, [filteredAndSortedComics]);

  const handleSingleDelete = React.useCallback((comic: StoredComic) => {
    setIsBulkDelete(false);
    setComicToDelete(comic);
  }, []);

  const handleBulkDelete = React.useCallback(() => {
    setIsBulkDelete(true);
    setComicToDelete({} as StoredComic); // Dummy object to open modal
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (isBulkDelete) {
      dispatch(deleteMultipleComicsFromLibrary(selectedComics));
      setSelectedComics([]);
    } else if (comicToDelete) {
      dispatch(deleteComicFromLibrary(comicToDelete.id));
    }
    setComicToDelete(null);
  }, [isBulkDelete, comicToDelete, selectedComics, dispatch]);

  const handleSelectComic = React.useCallback((id: string) => {
    setSelectedComics((prev) =>
      prev.includes(id)
        ? prev.filter((comicId) => comicId !== id)
        : [...prev, id],
    );
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedComics([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    selectedComics,
    handleSelectComic,
    clearSelection,
    comicToDelete,
    isBulkDelete,
    handleSingleDelete,
    handleBulkDelete,
    confirmDelete,
    cancelDelete: () => setComicToDelete(null),
    thumbnailUrls,
    filteredAndSortedComics,
  };
};

export type UseComicLibraryReturn = ReturnType<typeof useComicLibrary>;
