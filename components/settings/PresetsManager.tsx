import React, { useState } from 'react';
import { useSettingsPageContext } from '../../contexts/SettingsPageContext';
import { SaveIcon, TrashIcon } from '../Icons';

const PresetsManager: React.FC = () => {
    const { presets, handleSavePreset, handleDeletePreset, handleApplyPreset } = useSettingsPageContext();
    const [presetName, setPresetName] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string>('');

    const onSave = () => {
        if (presetName.trim()) {
            handleSavePreset(presetName.trim());
            setPresetName('');
        }
    };

    const onApply = (presetId: string) => {
        setSelectedPreset(presetId);
        const preset = presets.find(p => p.id === parseInt(presetId, 10));
        if (preset) {
            handleApplyPreset(preset);
        }
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Generation Presets</h4>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="New preset name..."
                    className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={onSave}
                    disabled={!presetName.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label="Save current settings as new preset"
                >
                    <SaveIcon className="w-5 h-5" />
                </button>
            </div>
            {presets.length > 0 && (
                <div className="flex gap-2">
                    <select
                        value={selectedPreset}
                        onChange={(e) => onApply(e.target.value)}
                        className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Apply a preset...</option>
                        {presets.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                     <button
                        onClick={() => selectedPreset && handleDeletePreset(parseInt(selectedPreset, 10))}
                        disabled={!selectedPreset}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        aria-label="Delete selected preset"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PresetsManager;
