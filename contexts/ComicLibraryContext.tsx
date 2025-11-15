import React from 'react';
import {
  useComicLibrary,
  UseComicLibraryReturn,
} from '../hooks/useComicLibrary';

const ComicLibraryContext = React.createContext<
  UseComicLibraryReturn | undefined
>(undefined);

export const useComicLibraryContext = () => {
  const context = React.useContext(ComicLibraryContext);
  if (!context) {
    throw new Error(
      'useComicLibraryContext must be used within a ComicLibraryProvider',
    );
  }
  return context;
};

export const ComicLibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const comicLibraryLogic = useComicLibrary();
  return (
    <ComicLibraryContext.Provider value={comicLibraryLogic}>
      {children}
    </ComicLibraryContext.Provider>
  );
};
