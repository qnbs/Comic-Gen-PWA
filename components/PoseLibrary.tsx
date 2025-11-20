import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch } from '../app/hooks';
import { addPoseToCharacter } from '../features/projectSlice';
import { Character } from '../types';
import PoseEditor from './PoseEditor';

interface PoseLibraryProps {
  character: Character;
}

const PoseLibrary: React.FC<PoseLibraryProps> = React.memo(({ character }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleAddPose = React.useCallback(() => {
    dispatch(addPoseToCharacter({ characterName: character.name }));
  }, [dispatch, character.name]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
      <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">{t('character.poseLibrary')}</h4>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {character.poses?.map(pose => (
          <PoseEditor key={pose.id} characterName={character.name} pose={pose} />
        ))}
      </div>
      <button
        onClick={handleAddPose}
        className="w-full mt-4 py-2 px-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 rounded-lg font-semibold transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-900"
      >
        {t('character.addPose')}
      </button>
    </div>
  );
});

export default PoseLibrary;