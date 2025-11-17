import React from 'react';
import { useComicLibraryContext } from '../../contexts/ComicLibraryContext';
import ComicCard from './ComicCard';
import { ComicProject } from '../../types';

interface ComicGridProps {
    onLoadProject: (project: ComicProject) => void;
}

const ComicGrid: React.FC<ComicGridProps> = ({ onLoadProject }) => {
    const { filteredAndSortedProjects } = useComicLibraryContext();

    return (
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[65vh] overflow-y-auto pr-2 pb-4">
            {filteredAndSortedProjects.map(project => (
                <ComicCard key={project.id} project={project} onLoadProject={onLoadProject} />
            ))}
        </div>
    );
};

export default ComicGrid;