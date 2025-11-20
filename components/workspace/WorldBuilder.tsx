
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { SparklesIcon, WandIcon, LoaderIcon, UsersIcon, MapPinIcon, CubeIcon } from '../Icons';
import { setActiveContext, addWorldAsset } from '../../features/projectSlice';
import WorldAssetCard from '../WorldAssetCard';
import { updateCharacterDescription, updateLocationDescription, updatePropDescription } from '../../features/projectSlice';
import { generateCharacterSheet, generateLocationSheet, generatePropSheet } from '../../features/worldThunks';
import { addToast } from '../../features/uiSlice';
import { Character, WorldAsset } from '../../types';

type WorldBuildingTab = 'characters' | 'locations' | 'props';

const WorldBuilder: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { project, activeContext } = useAppSelector(state => state.project.present);
    const [isBatchGenerating, setIsBatchGenerating] = React.useState(false);
    const [progress, setProgress] = React.useState({ current: 0, total: 0 });
    const [newItemName, setNewItemName] = React.useState('');
    
    if (!project) return null;
    if (!activeContext.type.startsWith('world-')) return null;

    const activeTab = activeContext.type.split('-')[1] as WorldBuildingTab;
    const { characters, locations, props, originalFullText } = project.worldDB;

    const handleBatchGenerate = async () => {
        if (!originalFullText) return;
        
        // Filter items based on active tab to avoid 'any' type casting
        let itemsToProcess: (Character | WorldAsset)[] = [];
        if (activeTab === 'characters') {
             itemsToProcess = characters.filter(c => !c.referenceImageId);
        } else if (activeTab === 'locations') {
             itemsToProcess = locations.filter(l => !l.referenceImageId);
        } else {
             itemsToProcess = props.filter(p => !p.referenceImageId);
        }

        if (itemsToProcess.length === 0) {
             dispatch(addToast({ message: t('worldBuilding.allGenerated'), type: 'info' }));
             return;
        }

        setIsBatchGenerating(true);
        setProgress({ current: 0, total: itemsToProcess.length });

        for (let i = 0; i < itemsToProcess.length; i++) {
            const item = itemsToProcess[i];
            try {
                if (activeTab === 'characters') {
                    await dispatch(generateCharacterSheet({ characterName: item.name, context: originalFullText })).unwrap();
                } else if (activeTab === 'locations') {
                    await dispatch(generateLocationSheet({ locationName: item.name, context: originalFullText })).unwrap();
                } else {
                    await dispatch(generatePropSheet({ propName: item.name, context: originalFullText })).unwrap();
                }
            } catch (e) {
                console.error(`Failed to generate for ${item.name}`, e);
                // Continue processing other items even if one fails
            }
            setProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setIsBatchGenerating(false);
        dispatch(addToast({ message: t('worldBuilding.complete'), type: 'success' }));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim()) {
            const typeMap: Record<WorldBuildingTab, 'character' | 'location' | 'prop'> = {
                characters: 'character',
                locations: 'location',
                props: 'prop'
            };
            dispatch(addWorldAsset({ type: typeMap[activeTab], name: newItemName.trim() }));
            setNewItemName('');
            dispatch(addToast({ message: 'Item added successfully', type: 'success' }));
        }
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'locations':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {locations.map(asset => (
                            <WorldAssetCard
                                key={asset.name}
                                asset={asset}
                                assetType="location"
                                onDescriptionChange={(name, description) => dispatch(updateLocationDescription({ name, description }))}
                                onGenerate={() => dispatch(generateLocationSheet({ locationName: asset.name, context: project.originalFullText! })).unwrap()}
                            />
                        ))}
                    </div>
                );
            case 'props':
                 return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {props.map(asset => (
                             <WorldAssetCard
                                key={asset.name}
                                asset={asset}
                                assetType="prop"
                                onDescriptionChange={(name, description) => dispatch(updatePropDescription({ name, description }))}
                                onGenerate={() => dispatch(generatePropSheet({ propName: asset.name, context: project.originalFullText! })).unwrap()}
                            />
                        ))}
                    </div>
                );
            case 'characters':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {characters.map(asset => (
                            <WorldAssetCard
                                key={asset.name}
                                asset={asset}
                                assetType="character"
                                onDescriptionChange={(name, description) => dispatch(updateCharacterDescription({ name, description }))}
                                onGenerate={() => dispatch(generateCharacterSheet({ characterName: asset.name, context: project.originalFullText! })).unwrap()}
                            />
                        ))}
                    </div>
                );
        }
    }

    return (
        <div className="p-8 h-full overflow-y-auto">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
                <SparklesIcon className="w-8 h-8" />
                {t('worldBuilding.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('worldBuilding.subtitle')}
                </p>
            </div>

            <div className="flex flex-col gap-6 mb-8">
                {/* Tabs and Batch Button */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm">
                        <button
                            onClick={() => dispatch(setActiveContext({ type: 'world-characters' }))}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'characters' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                             <UsersIcon className="w-4 h-4" />
                             {t('worldBuilding.tabCharacters')}
                        </button>
                        <button
                            onClick={() => dispatch(setActiveContext({ type: 'world-locations' }))}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'locations' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                             <MapPinIcon className="w-4 h-4" />
                             {t('worldBuilding.tabLocations')}
                        </button>
                        <button
                            onClick={() => dispatch(setActiveContext({ type: 'world-props' }))}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === 'props' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                             <CubeIcon className="w-4 h-4" />
                             {t('worldBuilding.tabProps')}
                        </button>
                    </div>

                    <button 
                        onClick={handleBatchGenerate}
                        disabled={isBatchGenerating}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow-md transition-all disabled:from-gray-500 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                        {isBatchGenerating ? (
                            <>
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                                {t('worldBuilding.generatingBatch', { current: progress.current, total: progress.total })}
                            </>
                        ) : (
                            <>
                                <WandIcon className="w-4 h-4" />
                                {t('worldBuilding.batchGenerate')}
                            </>
                        )}
                    </button>
                </div>

                {/* Add New Item Form */}
                <form onSubmit={handleAddItem} className="flex gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input 
                        type="text" 
                        value={newItemName} 
                        onChange={(e) => setNewItemName(e.target.value)} 
                        placeholder={t('worldBuilding.addItemPlaceholder')}
                        className="flex-grow bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={!newItemName.trim()}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('worldBuilding.add')}
                    </button>
                </form>
            </div>

            {renderContent()}
        </div>
    );
};

export default WorldBuilder;
