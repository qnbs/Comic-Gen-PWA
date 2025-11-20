import React from 'react';
import { ComicProjectMeta } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import { BookOpenIcon, TrashIcon, CheckCircleIcon, ArchiveIcon } from '../Icons';
import { useAppDispatch } from '../../app/hooks';
import { exportProjectFromJson } from '../../features/librarySlice';
import { addToast } from '../../features/uiSlice';

interface ComicCardProps {
  project: ComicProjectMeta;
  onLoadProject: (projectId: string) => void;
}

const ComicCard: React.FC<ComicCardProps> = ({ project, onLoadProject }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    thumbnailUrls,
    selectedProjects,
    handleSelectProject,
    handleSingleDelete,
  } = useComicLibraryContext();

  const isSelected = selectedProjects.includes(project.id);
  
  const thumbnailUrl = thumbnailUrls[project.id];

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(addToast({ message: 'Preparing export...', type: 'info' }));
    dispatch(exportProjectFromJson(project.id))
      .unwrap()
      .then(projectTitle => {
        dispatch(addToast({ message: `"${projectTitle}" exported.`, type: 'success' }));
      })
      .catch((error: unknown) => {
        dispatch(addToast({ message: String(error), type: 'error' }));
      });
  };

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ease-out cursor-pointer aspect-[2/3] ${
        isSelected 
            ? 'border-indigo-500 ring-4 ring-indigo-500/30 transform scale-[1.02] shadow-2xl' 
            : 'border-gray-200 dark:border-gray-700 shadow-md hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700'
      }`}
      onClick={() => handleSelectProject(project.id)}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
        (e.key === 'Enter' || e.key === ' ') && handleSelectProject(project.id)
      }
    >
      {/* Selection Checkmark - Always visible if selected, or on hover */}
      <div
        className={`absolute top-3 right-3 z-20 transition-all duration-200 transform ${
          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
        }`}
      >
        <div className={`rounded-full p-1.5 ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-black/40 text-white backdrop-blur-md border border-white/30 hover:bg-indigo-600'}`}>
            <CheckCircleIcon className="w-5 h-5" />
        </div>
      </div>

      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
            <BookOpenIcon className="w-16 h-16 mb-2" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
      </div>


      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1 drop-shadow-lg group-hover:text-indigo-200 transition-colors">
            {project.title}
        </h3>
        <p className="text-gray-300 text-xs font-medium mb-4">
          {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="grid grid-cols-4 gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadProject(project.id);
            }}
            className="col-span-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            aria-label={`${t('comicLibrary.load')} ${project.title}`}
          >
            <BookOpenIcon className="w-4 h-4" />
            {t('comicLibrary.load')}
          </button>
          <button
            onClick={handleExport}
            className="col-span-1 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white rounded-xl transition-colors flex items-center justify-center"
            title="Export project data"
            aria-label={`Export ${project.title}`}
          >
            <ArchiveIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSingleDelete(project);
            }}
            className="col-span-1 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-xl transition-colors backdrop-blur-md flex items-center justify-center"
            aria-label={`${t('comicLibrary.delete')} ${project.title}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComicCard;