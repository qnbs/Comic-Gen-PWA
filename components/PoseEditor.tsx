import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch } from '../app/hooks';
import { removePoseFromCharacter, updatePose } from '../features/projectSlice';
import { generatePoseImage } from '../features/worldThunks';
import { Pose } from '../types';
import { TrashIcon, WandIcon } from './Icons';
import { getMediaBlob } from '../services/db';

interface PoseEditorProps {
  characterName: string;
  pose: Pose;
}

const PoseEditor: React.FC<PoseEditorProps> = React.memo(({ characterName, pose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [name, setName] = React.useState(pose.name);
  const [description, setDescription] = React.useState(pose.description);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let objectUrl: string | undefined;
    const loadImage = async () => {
      if (pose.referenceImageId) {
        const blob = await getMediaBlob(pose.referenceImageId);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } else {
        setImageUrl(null);
      }
    };
    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pose.referenceImageId]);

  const handleUpdate = React.useCallback(() => {
    if (pose.name !== name || pose.description !== description) {
      dispatch(updatePose({ characterName, poseId: pose.id, name, description }));
    }
  }, [dispatch, characterName, pose.id, pose.name, pose.description, name, description]);

  const handleGenerate = React.useCallback(async () => {
    if (!description.trim()) {
        setError("A description is required to generate a pose.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await dispatch(generatePoseImage({
        characterName,
        poseId: pose.id,
        poseDescription: description,
      })).unwrap();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate pose image.");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, characterName, pose.id, description]);

  const handleDelete = React.useCallback(() => {
    if (window.confirm(`Are you sure you want to delete the pose "${name}"?`)) {
        dispatch(removePoseFromCharacter({ characterName, poseId: pose.id }));
    }
  }, [dispatch, characterName, pose.id, name]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md border border-gray-300 dark:border-gray-600 flex flex-col sm:flex-row gap-4">
      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center relative self-center">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-md" />
        ) : (
          <WandIcon className="w-8 h-8 text-gray-400" />
        )}
        {isLoading && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div></div>}
      </div>
      <div className="flex-grow space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleUpdate}
          placeholder={t('character.poseName')}
          className="w-full text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md p-1.5"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleUpdate}
          placeholder={t('character.poseDescription')}
          className="w-full text-xs h-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-md p-1.5"
          rows={3}
        />
         {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}
      </div>
      <div className="flex sm:flex-col gap-2 justify-center self-center">
        <button onClick={handleGenerate} disabled={isLoading || !description.trim()} className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-500" aria-label={t('character.generatePose')}><WandIcon className="w-5 h-5" /></button>
        <button onClick={handleDelete} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700" aria-label="Delete pose"><TrashIcon className="w-5 h-5" /></button>
      </div>
    </div>
  );
});

export default PoseEditor;