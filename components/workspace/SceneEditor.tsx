import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { updateScene, setActiveContext } from '../../features/projectSlice';
import { Scene } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { BookOpenIcon, EditIcon, SaveIcon, XIcon } from '../Icons';

const EditableSceneCard: React.FC<{
  sceneId: string;
  sceneNumber: number;
  chapterIndex: number;
}> = React.memo(({ sceneId, sceneNumber, chapterIndex }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const scene = useAppSelector(state => state.project.present.entities.scenes[sceneId]);
  const { activeContext } = useAppSelector(state => state.project.present);

  const [isEditing, setIsEditing] = React.useState(false);
  const [editableScene, setEditableScene] = React.useState<Scene>(scene);

  const isActive = activeContext.type === 'scene' && activeContext.chapterId === chapterIndex && activeContext.sceneId === sceneNumber - 1;

  React.useEffect(() => {
    setEditableScene(scene);
  }, [scene]);

  const handleEditToggle = React.useCallback(() => {
    if (isEditing) {
      setEditableScene(scene);
    }
    setIsEditing(!isEditing);
  }, [isEditing, scene]);

  const handleSave = React.useCallback(() => {
    dispatch(
      updateScene({
        sceneId,
        updatedScene: editableScene,
      }),
    );
    setIsEditing(false);
  }, [dispatch, sceneId, editableScene]);

  const handleChange = React.useCallback(
    (field: keyof Scene, value: string | number | string[]) => {
      setEditableScene((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  if (!scene) {
    return null; // or a loading/error state
  }

  const getActionColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
    if (score >= 5) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  // Updated standard input class: No border, soft background, ring focus.
  const inputClass = "w-full text-sm bg-gray-50 dark:bg-gray-900/50 border-transparent focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all rounded-xl px-4 py-3 outline-none placeholder-gray-400";

  return (
    <div
      onClick={() => dispatch(setActiveContext({ type: 'scene', chapterId: chapterIndex, sceneId: sceneNumber - 1 }))}
      className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
          isActive 
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg transform scale-[1.01]' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-lg shadow-sm ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors'}`}>
                {sceneNumber}
            </div>
           <div>
               <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xl leading-tight">
                {t('scene.title', { index: sceneNumber })}
              </h4>
              {!isEditing && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px] sm:max-w-md">{scene.summary}</p>}
           </div>
        </div>
       
        <div className="flex items-center gap-3">
             {!isEditing && (
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getActionColor(scene.actionScore)} shadow-sm`} title={t('scene.actionScore')}>
                  {t('scene.intensity')}: {scene.actionScore}/10
                </div>
            )}
            <div className="flex gap-2">
                {isEditing && (
                    <button
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className="p-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-md"
                    aria-label={t('common.save')}
                    >
                    <SaveIcon className="w-5 h-5" />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); handleEditToggle(); }}
                    className="p-2.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 bg-gray-100 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                    aria-label={isEditing ? t('common.cancel') : t('common.edit')}
                >
                    {isEditing ? <XIcon className="w-5 h-5"/> : <EditIcon className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
           <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex justify-between mb-4">
                    {t('scene.actionScore')}
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-lg font-mono">{editableScene.actionScore}/10</span>
                </label>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={editableScene.actionScore} 
                    onChange={(e) => handleChange('actionScore', parseInt(e.target.value))} 
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                  <span>{t('scene.quiet')}</span>
                  <span>{t('scene.balanced')}</span>
                  <span>{t('scene.dynamic')}</span>
                </div>
           </div>
           
           <div className="grid gap-5">
                <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 ml-1">{t('scene.summary')}</label>
                        <input type="text" value={editableScene.summary} onChange={(e) => handleChange('summary', e.target.value)} className={inputClass}/>
                </div>
                <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 ml-1">{t('scene.characters')}</label>
                        <input type="text" value={editableScene.characters.join(', ')} onChange={(e) => handleChange('characters', e.target.value.split(',').map(c => c.trim()))} className={inputClass}/>
                </div>
                <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 ml-1">{t('scene.dialogue')}</label>
                        <textarea value={editableScene.dialogue} onChange={(e) => handleChange('dialogue', e.target.value)} className={inputClass} rows={3}/>
                </div>
                <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2 ml-1 flex items-center gap-2">
                            <BookOpenIcon className="w-4 h-4" />
                            {t('scene.visualPrompt')}
                        </label>
                        <textarea value={editableScene.visualPrompt} onChange={(e) => handleChange('visualPrompt', e.target.value)} className={`${inputClass} font-mono text-xs leading-relaxed bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 focus:border-indigo-500`} rows={6}/>
                </div>
           </div>
        </div>
      ) : (
         <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700 ml-2">
            <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block mb-1">{t('scene.summary')}</span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{scene.summary}</p>
            </div>
            
            {scene.characters.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {scene.characters.map(char => (
                        <span key={char} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-semibold">
                            {char}
                        </span>
                    ))}
                </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 mt-2 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30"></div>
                 <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-500/80 block mb-2 flex items-center gap-2">
                   <BookOpenIcon className="w-3 h-3" /> {t('scene.visualPrompt')}
                 </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed font-mono">{scene.visualPrompt}</p>
            </div>
         </div>
      )}
    </div>
  );
});


const SceneEditor: React.FC = () => {
    const { t } = useTranslation();
    const { project, activeContext } = useAppSelector(state => state.project.present);

    if (!project || (activeContext.type !== 'chapter' && activeContext.type !== 'scene')) return null;

    const chapterIndex = activeContext.type === 'chapter' ? activeContext.id : activeContext.chapterId;
    const chapter = project.chapters[chapterIndex];
    
    if (!chapter) return <p>{t('scene.chapterNotFound')}</p>;

    return (
        <div className="p-4 sm:p-8 h-full overflow-y-auto pb-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3 mb-3">
                    <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                    {t('scene.reviewTitle')}
                </h2>
                <div className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                    {chapter.title}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-xl mx-auto text-sm sm:text-base">
                    {t('scene.reviewSubtitle')}
                </p>
            </div>
             <div className="space-y-8 max-w-3xl mx-auto">
                {chapter.scenes.map((sceneId, index) => (
                    <EditableSceneCard
                        key={sceneId}
                        sceneId={sceneId}
                        sceneNumber={index + 1}
                        chapterIndex={chapter.chapterIndex}
                    />
                ))}
            </div>
        </div>
    );
};

export default SceneEditor;