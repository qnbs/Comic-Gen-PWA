import React from 'react';
import { ComicProject } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import { BookOpenIcon, TrashIcon, CheckCircleIcon } from '../Icons';

interface ComicCardProps {
  project: ComicProject;
  onLoadProject: (project: ComicProject) => void;
}

const ComicCard: React.FC<ComicCardProps> = ({ project, onLoadProject }) => {
  const { t } = useTranslation();
  const { thumbnailUrls, selectedProjects, handleSelectProject, handleSingleDelete } =
    useComicLibraryContext();

  const isSelected = selectedProjects.includes(project.id);

  return (
    <div
      className="group relative rounded-lg overflow-hidden border-2 border-transparent focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 cursor-pointer"
      onClick={() => handleSelectProject(project.id)}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
        (e.key === 'Enter' || e.key === ' ') && handleSelectProject(project.id)
      }
    >
      <div
        className={`absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded-full transition-opacity duration-200 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <CheckCircleIcon
          className={`w-6 h-6 transition-colors ${
            isSelected
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        />
      </div>

      <img
        src={thumbnailUrls[project.id]}
        alt={project.title}
        className="aspect-[3/4] w-full object-cover bg-gray-200 dark:bg-gray-700 transition-transform duration-300 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg">{project.title}</h3>
        <p className="text-gray-300 text-xs">
          {new Date(project.createdAt).toLocaleDateString()}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadProject(project);
            }}
            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors"
            aria-label={`${t('comicLibrary.load')} ${project.title}`}
          >
            <BookOpenIcon className="w-4 h-4" />
            {t('comicLibrary.load')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSingleDelete(project);
            }}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
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