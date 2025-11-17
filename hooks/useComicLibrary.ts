import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  deleteProjectFromLibrary,
  deleteMultipleProjectsFromLibrary,
} from '../features/librarySlice';
import { selectFilteredAndSortedProjects } from '../features/librarySelectors';
import type { ComicProject } from '../types';
import type { SortOption } from '../components/comic-library/types';
import { base64ToBlob } from '../services/utils';

export const useComicLibrary = () => {
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<SortOption>('date-desc');
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [projectToDelete, setProjectToDelete] = React.useState<ComicProject | null>(
    null,
  );
  const [isBulkDelete, setIsBulkDelete] = React.useState(false);
  const [thumbnailUrls, setThumbnailUrls] = React.useState<
    Record<string, string>
  >({});
  const memoizedUrls = React.useRef<Record<string, string>>({});

  const filteredAndSortedProjects = useAppSelector((state) =>
    selectFilteredAndSortedProjects(state, searchQuery, sortOrder),
  );

  React.useEffect(() => {
    const newUrls: Record<string, string> = {};
    filteredAndSortedProjects.forEach((project) => {
      if (memoizedUrls.current[project.id]) {
        newUrls[project.id] = memoizedUrls.current[project.id];
      } else if (project.pages?.[0]?.panels?.[0]?.imageUrl) {
         // Projects store full base64 strings if saved from older versions, or blob URLs for new ones.
        const imageUrl = project.pages[0].panels[0].imageUrl;
        if (imageUrl.startsWith('blob:')) {
            // It's already a URL, just use it.
            newUrls[project.id] = imageUrl;
        } else if (imageUrl.startsWith('data:')) {
            // It's a base64 string, convert it.
            const base64String = imageUrl.split(',')[1];
            if (base64String) {
              try {
                const blob = base64ToBlob(base64String);
                const url = URL.createObjectURL(blob);
                memoizedUrls.current[project.id] = url;
                newUrls[project.id] = url;
              } catch (e) {
                console.error(`Failed to create blob for project ${project.id}`, e);
              }
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
  }, [filteredAndSortedProjects]);

  const handleSingleDelete = React.useCallback((project: ComicProject) => {
    setIsBulkDelete(false);
    setProjectToDelete(project);
  }, []);

  const handleBulkDelete = React.useCallback(() => {
    setIsBulkDelete(true);
    setProjectToDelete({} as ComicProject); // Dummy object to open modal
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (isBulkDelete) {
      dispatch(deleteMultipleProjectsFromLibrary(selectedProjects));
      setSelectedProjects([]);
    } else if (projectToDelete) {
      dispatch(deleteProjectFromLibrary(projectToDelete.id));
    }
    setProjectToDelete(null);
  }, [isBulkDelete, projectToDelete, selectedProjects, dispatch]);

  const handleSelectProject = React.useCallback((id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id)
        ? prev.filter((projectId) => projectId !== id)
        : [...prev, id],
    );
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedProjects([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    selectedProjects,
    handleSelectProject,
    clearSelection,
    projectToDelete,
    isBulkDelete,
    handleSingleDelete,
    handleBulkDelete,
    confirmDelete,
    cancelDelete: () => setProjectToDelete(null),
    thumbnailUrls,
    filteredAndSortedProjects,
  };
};

export type UseComicLibraryReturn = ReturnType<typeof useComicLibrary>;