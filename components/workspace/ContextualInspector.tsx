import React from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Scene, Character, WorldAsset } from '../../types';
import WorldAssetCard from '../WorldAssetCard';
import {
  updateCharacterDescription,
  updateLocationDescription,
  updatePropDescription,
} from '../../features/projectSlice';
import {
  generateCharacterSheet,
  generateLocationSheet,
  generatePropSheet,
} from '../../features/worldThunks';
import { RegeneratePanelSimple } from './RegeneratePanelSimple';
import { useTranslation } from '../../hooks/useTranslation';

const SceneAssets: React.FC<{ scene: Scene }> = ({ scene }) => {
  const { t } = useTranslation();
  const { project } = useAppSelector(state => state.project.present);
  const worldDB = project!.worldDB;
  const originalFullText = project!.originalFullText;
  const dispatch = useAppDispatch();

  const getAsset = (name: string, type: 'character' | 'location' | 'prop'): Character | WorldAsset | undefined => {
    return worldDB[type === 'character' ? 'characters' : (type === 'location' ? 'locations' : 'props')].find(a => a.name === name);
  };
  
  const characters = scene.characters.map(name => getAsset(name, 'character')).filter(Boolean) as Character[];
  const props = scene.props.map(name => getAsset(name, 'prop')).filter(Boolean) as WorldAsset[];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold uppercase text-gray-500">{t('inspector.assetsInScene')}</h4>
      {characters.map(char => (
        <WorldAssetCard
          key={char.name}
          asset={char}
          assetType="character"
          onDescriptionChange={(name, description) => dispatch(updateCharacterDescription({ name, description }))}
          onGenerate={() => dispatch(generateCharacterSheet({ characterName: char.name, context: originalFullText! })).unwrap()}
        />
      ))}
      {props.map(prop => (
         <WorldAssetCard
          key={prop.name}
          asset={prop}
          assetType="prop"
          onDescriptionChange={(name, description) => dispatch(updatePropDescription({ name, description }))}
          onGenerate={() => dispatch(generatePropSheet({ propName: prop.name, context: originalFullText! })).unwrap()}
        />
      ))}
       {characters.length === 0 && props.length === 0 && <p className="text-xs text-gray-500">{t('inspector.noAssetsInScene')}</p>}
    </div>
  );
};

const PanelInspector: React.FC<{ pageId: number, panelId: string }> = ({ pageId, panelId }) => {
  const { t } = useTranslation();
    const { project, entities } = useAppSelector(state => state.project.present);
    const page = project?.pages.find(p => p.pageNumber === pageId);
    const panel = page?.panels.find(p => p.id === panelId);
    
    if (!project || !page || !panel) return null;

    const scene = entities.scenes[panel.sceneId];
    if (!scene) return <p>{t('inspector.sourceSceneMissing')}</p>;

    return <RegeneratePanelSimple panel={panel} />;
};


const ContextualInspector: React.FC = () => {
  const { t } = useTranslation();
  const { project, entities, activeContext } = useAppSelector((state) => state.project.present);

  if (!project) return null;

  const renderInspectorContent = () => {
    switch (activeContext.type) {
      case 'scene':
        const sceneId = `c${activeContext.chapterId}-s${activeContext.sceneId}`;
        const scene = entities.scenes[sceneId];
        return scene ? <SceneAssets scene={scene} /> : null;
      
      case 'panel':
        return <PanelInspector pageId={activeContext.pageId} panelId={activeContext.panelId} />;

      default:
        return (
          <div className="text-center text-sm text-gray-500 p-4">
            <p>{t('inspector.emptyHint')}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
       <div className="h-full overflow-y-auto">
         {renderInspectorContent()}
       </div>
    </div>
  );
};

export default ContextualInspector;