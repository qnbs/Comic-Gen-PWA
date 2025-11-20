import React from 'react';
import { useAppDispatch, useAppSelector, useFocusTrap } from '../app/hooks';
import { useTranslation } from '../hooks/useTranslation';
import { setShowOnboardingWizard, setOnboardingWizardStep } from '../features/uiSlice';
import { BookOpenIcon, EditIcon, SparklesIcon, ScissorsIcon, ImageIcon, CheckCircleIcon } from './Icons';
import LanguageSelector from './LanguageSelector';

const OnboardingWizard: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { showOnboardingWizard, onboardingWizardStep } = useAppSelector(state => state.ui);
    const modalRef = React.useRef<HTMLDivElement>(null);

    const handleSkip = React.useCallback(() => {
        dispatch(setShowOnboardingWizard(false));
    }, [dispatch]);
    
    useFocusTrap(modalRef, showOnboardingWizard, handleSkip);

    const steps = React.useMemo(() => [
        { icon: <BookOpenIcon className="w-10 h-10" />, title: t('onboarding.step0.title'), body: t('onboarding.step0.body') },
        { icon: <BookOpenIcon className="w-10 h-10" />, title: t('onboarding.step1.title'), body: t('onboarding.step1.body') },
        { icon: <EditIcon className="w-10 h-10" />, title: t('onboarding.step2.title'), body: t('onboarding.step2.body') },
        { icon: <SparklesIcon className="w-10 h-10" />, title: t('onboarding.step3.title'), body: t('onboarding.step3.body') },
        { icon: <ScissorsIcon className="w-10 h-10" />, title: t('onboarding.step4.title'), body: t('onboarding.step4.body') },
        { icon: <ImageIcon className="w-10 h-10" />, title: t('onboarding.step5.title'), body: t('onboarding.step5.body') },
        { icon: <CheckCircleIcon className="w-10 h-10" />, title: t('onboarding.step6.title'), body: t('onboarding.step6.body') },
    ], [t]);

    const handleNext = React.useCallback(() => {
        if (onboardingWizardStep < steps.length - 1) {
            dispatch(setOnboardingWizardStep(onboardingWizardStep + 1));
        } else {
            dispatch(setShowOnboardingWizard(false));
        }
    }, [dispatch, onboardingWizardStep, steps.length]);

    const handleBack = React.useCallback(() => {
        if (onboardingWizardStep > 0) {
            dispatch(setOnboardingWizardStep(onboardingWizardStep - 1));
        }
    }, [dispatch, onboardingWizardStep]);
    
    if (!showOnboardingWizard) {
        return null;
    }

    const currentStep = steps[onboardingWizardStep];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-300 dark:border-gray-700 transform transition-all animate-fade-in-up">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 mb-4">
                        {currentStep.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
                        {currentStep.title}
                    </h3>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {currentStep.body}
                    </p>
                    {onboardingWizardStep === 0 && (
                        <div className="mt-6 flex justify-center">
                            <LanguageSelector />
                        </div>
                    )}
                </div>
                
                <div className="mt-8 flex items-center justify-center space-x-2">
                    {steps.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === onboardingWizardStep ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 items-center">
                    <div className="text-left">
                         {onboardingWizardStep > 0 && (
                            <button onClick={handleBack} className="py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                                {t('onboarding.back')}
                            </button>
                        )}
                    </div>
                    <div className="text-right flex justify-end gap-2">
                         <button onClick={handleSkip} className="py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                                {t('onboarding.skip')}
                        </button>
                        <button onClick={handleNext} className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 shadow-md">
                            {onboardingWizardStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default React.memo(OnboardingWizard);
