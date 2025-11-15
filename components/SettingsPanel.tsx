import React, { useState, useEffect, useMemo } from 'react';
import { hierarchy, treemap, treemapSquarify, treemapSliceDice, treemapBinary } from 'd3-hierarchy';
import type { AppSettings, LayoutAlgorithm, ImageQuality, AspectRatio } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const LayoutPreview: React.FC<{ layout: LayoutAlgorithm }> = ({ layout }) => {
    const sampleData = useMemo(() => ({
      name: 'root',
      children: [
        { name: 'scene1', actionScore: 10 },
        { name: 'scene2', actionScore: 4 },
        { name: 'scene3', actionScore: 7 },
        { name: 'scene4', actionScore: 2 },
        { name: 'scene5', actionScore: 5 },
      ],
    }), []);
  
    const panels = useMemo(() => {
      const root = hierarchy(sampleData)
        .sum(d => (d as any).actionScore)
        .sort((a, b) => ((b.value ?? 0) - (a.value ?? 0)));
  
      const treemapLayout = treemap().size([220, 320]).padding(4);
  
      if (layout === 'strip') {
        treemapLayout.tile(treemapSliceDice);
      } else if (layout === 'binary') {
        treemapLayout.tile(treemapBinary);
      } else {
        treemapLayout.tile(treemapSquarify);
      }
  
      treemapLayout(root);
      return (root.leaves() as any[]).map((leaf, index) => ({
        key: `preview-${index}`,
        x: leaf.x0,
        y: leaf.y0,
        width: leaf.x1 - leaf.x0,
        height: leaf.y1 - leaf.y0,
      }));
    }, [layout, sampleData]);
  
    return (
      <div className="relative w-full aspect-[11/16] bg-gray-200 dark:bg-gray-900 rounded-md overflow-hidden">
        {panels.map((p) => (
          <div
            key={p.key}
            className="absolute bg-indigo-500/50 border border-indigo-400 rounded-sm"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              width: `${p.width}px`,
              height: `${p.height}px`,
            }}
          />
        ))}
      </div>
    );
  };
  

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const checkStorage = async () => {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                setStorageInfo({
                    usage: estimate.usage ?? 0,
                    quota: estimate.quota ?? 1, // Avoid division by zero
                });
            }
        } catch (error) {
            console.warn("Could not estimate storage quota:", error);
        }
    };
    checkStorage();
  }, []);

  const handleToggle = (key: keyof AppSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };
  
  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };


  const usagePercent = storageInfo ? (storageInfo.usage / storageInfo.quota) * 100 : 0;
  const usageMB = storageInfo ? (storageInfo.usage / (1024 * 1024)).toFixed(2) : 0;
  const quotaMB = storageInfo ? (storageInfo.quota / (1024 * 1024)).toFixed(2) : 0;
  const isStorageWarning = usagePercent > 90;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 space-y-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings.title')}</h3>
      
      {/* Speech Bubbles Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="speech-bubble-toggle" className="text-gray-700 dark:text-gray-300">
          {t('settings.showSpeechBubbles')}
        </label>
        <button
          id="speech-bubble-toggle"
          onClick={() => handleToggle('showSpeechBubbles')}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            settings.showSpeechBubbles ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'
          }`}
          aria-pressed={settings.showSpeechBubbles}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
              settings.showSpeechBubbles ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Font Size */}
      <div>
        <label htmlFor="font-size-slider" className="block text-gray-700 dark:text-gray-300 mb-2">{t('settings.bubbleFontSize')}</label>
        <div className="flex items-center gap-3">
            <input id="font-size-slider" type="range" min="10" max="24" step="1"
                value={settings.speechBubbleFontSize}
                onChange={e => handleSettingChange('speechBubbleFontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono p-1 bg-gray-100 dark:bg-gray-900 rounded-md w-12 text-center">{settings.speechBubbleFontSize}px</span>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label htmlFor="font-family-select" className="block text-gray-700 dark:text-gray-300 mb-2">{t('settings.bubbleFont')}</label>
        <select id="font-family-select"
            value={settings.speechBubbleFontFamily}
            onChange={e => handleSettingChange('speechBubbleFontFamily', e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
            <option style={{fontFamily: "'Bangers', cursive"}} value="'Bangers', cursive">{t('settings.fontBangers')}</option>
            <option style={{fontFamily: "Arial, sans-serif"}} value="Arial, sans-serif">Arial</option>
            <option style={{fontFamily: "Verdana, sans-serif"}} value="Verdana, sans-serif">Verdana</option>
            <option style={{fontFamily: "'Times New Roman', serif"}} value="'Times New Roman', serif">Times New Roman</option>
        </select>
      </div>

      {/* Image Quality */}
      <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('settings.imageQuality')}</label>
          <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
              {(['low', 'medium', 'high'] as ImageQuality[]).map(quality => (
                  <button key={quality} onClick={() => handleSettingChange('imageQuality', quality)} className={`w-1/3 py-1 text-sm rounded transition-colors capitalize ${settings.imageQuality === quality ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                      {t(`settings.quality${quality.charAt(0).toUpperCase() + quality.slice(1)}` as any)}
                  </button>
              ))}
          </div>
      </div>

      {/* Aspect Ratio */}
      <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('settings.aspectRatio')}</label>
          <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-gray-900 rounded-md p-1">
              {(['1:1', '4:3', '3:4', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                  <button key={ratio} onClick={() => handleSettingChange('aspectRatio', ratio)} className={`py-1 text-xs rounded transition-colors ${settings.aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                      {ratio}
                  </button>
              ))}
          </div>
      </div>

      {/* Layout Algorithm */}
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-2">{t('settings.panelLayout')}</label>
        <div className="flex bg-gray-100 dark:bg-gray-900 rounded-md p-1">
            {(['squarified', 'strip', 'binary'] as LayoutAlgorithm[]).map(layout => (
                <button key={layout} onClick={() => handleSettingChange('layoutAlgorithm', layout)} className={`w-1/3 py-1 text-sm rounded transition-colors capitalize ${settings.layoutAlgorithm === layout ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
                    {t(`settings.layout${layout.charAt(0).toUpperCase() + layout.slice(1)}` as any)}
                </button>
            ))}
        </div>
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-md">
            <LayoutPreview layout={settings.layoutAlgorithm} />
        </div>
      </div>
      

      {/* Storage Quota */}
      {storageInfo && (
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">{t('settings.localStorage')}</label>
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-colors ${isStorageWarning ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{usageMB} MB / {quotaMB} MB {t('settings.used')}</p>
          {isStorageWarning && (
            <p className="text-xs text-red-400 mt-2 text-center font-semibold">
              {t('settings.storageWarning')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;