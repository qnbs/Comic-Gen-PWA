import React from 'react';
import { ProjectGenerationState } from '../types';
import { BookOpenIcon, ImageIcon, WandIcon, ScissorsIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppSelector } from '../app/hooks';

interface LoaderProps {
  state: ProjectGenerationState;
}

const Loader: React.FC<LoaderProps> = ({ state }) => {
  const { t } = useTranslation();
  const { creationProgress } = useAppSelector((state) => state.project.present);

  const loadingInfo = React.useMemo(() => {
    if (state === ProjectGenerationState.GLOBAL_ANALYSIS && creationProgress) {
      return {
        icon: <BookOpenIcon className="w-12 h-12" />,
        text: t('loader.statusInitializing'),
        description: creationProgress.step,
        phase: t('loader.phaseAnalysis')
      };
    }

    switch (state) {
      case ProjectGenerationState.GLOBAL_ANALYSIS:
        return {
          icon: <BookOpenIcon className="w-12 h-12" />,
          text: t('loader.statusAnalyzing'),
          description: t('loader.analyzingTextDesc'),
          phase: t('loader.phaseDeconstruction')
        };
      case ProjectGenerationState.GENERATING_PAGES:
        return {
          icon: <ImageIcon className="w-12 h-12" />,
          text: t('loader.statusRendering'),
          description: t('loader.generatingImagesDesc'),
          phase: t('loader.phaseSynthesis')
        };
      case ProjectGenerationState.WORLD_BUILDING:
        return {
          icon: <WandIcon className="w-12 h-12" />,
          text: t('loader.statusBuilding'),
          description: t('loader.buildingVisualMatrix'),
          phase: t('loader.phaseConstruction')
        };
      case ProjectGenerationState.PAGE_LAYOUT:
        return {
          icon: <ScissorsIcon className="w-12 h-12" />,
          text: t('loader.statusComposing'),
          description: t('loader.calculatingPanelGeometry'),
          phase: t('loader.phaseLayout')
        };
      default:
        return {
          icon: null,
          text: t('loader.loading'),
          description: t('loader.pleaseWait'),
          phase: t('loader.phaseLoading')
        };
    }
  }, [state, t, creationProgress]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] p-8 w-full"
      role="alert"
      aria-live="assertive"
    >
      {/* Holographic Container */}
      <div className="relative p-10 border border-indigo-500/30 bg-black/5 dark:bg-black/20 backdrop-blur-sm rounded-2xl shadow-[0_0_15px_rgba(79,70,229,0.1)] max-w-md w-full overflow-hidden">
         {/* Scanning line */}
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 animate-scan"></div>
         
         <div className="flex flex-col items-center z-10 relative">
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                {/* Outer spinning ring */}
                <div className="absolute inset-0 border-2 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin duration-[3s]"></div>
                {/* Inner spinning ring */}
                <div className="absolute inset-2 border-2 border-t-transparent border-r-cyan-500 border-b-transparent border-l-pink-500 rounded-full animate-spin duration-[2s] direction-reverse"></div>
                
                <div className="text-indigo-600 dark:text-indigo-400 animate-pulse">
                  {loadingInfo.icon}
                </div>
            </div>
            
            <div className="text-xs font-mono text-indigo-500 dark:text-indigo-400 tracking-widest mb-1">
                PHASE: {loadingInfo.phase}
            </div>
            
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight text-center mb-4">
                {loadingInfo.text}
            </h2>
            
            <p className="text-center text-gray-600 dark:text-gray-400 font-mono text-sm h-10 flex items-center justify-center">
                {'>'} {loadingInfo.description}
            </p>

            {creationProgress && (
                <div className="w-full mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      <span>{t('loader.completion')}</span>
                        <span>{creationProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-none h-1.5 overflow-hidden border border-gray-300 dark:border-gray-700">
                        <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300 ease-out relative"
                        style={{ width: `${creationProgress.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1s_infinite]"></div>
                        </div>
                    </div>
                </div>
            )}
         </div>
         
         {/* Decorative corner markers */}
         <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-400/50"></div>
         <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-400/50"></div>
         <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-400/50"></div>
         <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-400/50"></div>
      </div>
      
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { top: 100%; opacity: 0; }
        }
        @keyframes shimmer {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
        }
        .animate-scan {
            animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Loader);