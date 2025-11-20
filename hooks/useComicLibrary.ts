import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  deleteProjectFromLibrary,
  deleteMultipleProjectsFromLibrary,
} from '../features/librarySlice';
import { selectFilteredAndSortedProjects } from '../features/librarySelectors';
import type { ComicProjectMeta } from '../types';
import type { SortOption } from '../components/comic-library/types';
import { getMediaBlob } from '../services/db';
import { addToast } from '../features/uiSlice';

export const useComicLibrary = () => {
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<SortOption>('date-desc');
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [projectToDelete, setProjectToDelete] = React.useState<ComicProjectMeta | null>(
    null,
  );
  const [isBulkDelete, setIsBulkDelete] = React.useState(false);
  const [thumbnailUrls, setThumbnailUrls] = React.useState<
    Record<string, string>
  >({});

  const filteredAndSortedProjects = useAppSelector((state) =>
    selectFilteredAndSortedProjects(state, searchQuery, sortOrder),
  );
  
  React.useEffect(() => {
    const currentUrls = { ...thumbnailUrls };
    let didUpdate = false;

    const loadThumbnails = async () => {
      for (const project of filteredAndSortedProjects) {
        if (!currentUrls[project.id] && project.thumbnailId) {
          const blob = await getMediaBlob(project.thumbnailId);
          if (blob) {
            currentUrls[project.id] = URL.createObjectURL(blob);
            didUpdate = true;
          }
        }
      }
      if (didUpdate) {
        setThumbnailUrls(currentUrls);
      }
    };

    loadThumbnails();

    return () => {
      // Revoke URLs only for projects that are no longer in the view
      const visibleIds = new Set(filteredAndSortedProjects.map(p => p.id));
      Object.keys(thumbnailUrls).forEach(id => {
        if (!visibleIds.has(id)) {
          URL.revokeObjectURL(thumbnailUrls[id]);
        }
      });
    };
  }, [filteredAndSortedProjects]);


  const handleSingleDelete = React.useCallback((project: ComicProjectMeta) => {
    setIsBulkDelete(false);
    setProjectToDelete(project);
  }, []);

  const handleBulkDelete = React.useCallback(() => {
    if (selectedProjects.length === 0) return;
    setIsBulkDelete(true);
    setProjectToDelete({} as ComicProjectMeta); // Dummy object to open modal
  }, [selectedProjects]);

  const confirmDelete = React.useCallback(() => {
    if (isBulkDelete) {
      dispatch(deleteMultipleProjectsFromLibrary(selectedProjects))
        .unwrap()
        .then(() => {
          dispatch(addToast({ message: `${selectedProjects.length} comics deleted.`, type: 'success' }));
          setSelectedProjects([]);
        })
        .catch((error: unknown) => {
          dispatch(addToast({ message: String(error), type: 'error' }));
        });
    } else if (projectToDelete) {
      dispatch(deleteProjectFromLibrary(projectToDelete.id))
        .unwrap()
        .then(() => {
          dispatch(addToast({ message: `"${projectToDelete.title}" deleted.`, type: 'success' }));
        })
        .catch((error: unknown) => {
          dispatch(addToast({ message: String(error), type: 'error' }));
        });
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