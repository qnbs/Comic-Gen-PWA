import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface HelpPageProps {
  onBack: () => void;
}

const FaqItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
  <details className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
    <summary className="font-semibold cursor-pointer text-indigo-700 dark:text-indigo-300">{question}</summary>
    <p className="mt-2 text-gray-700 dark:text-gray-300">{answer}</p>
  </details>
);

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section>
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="space-y-3 text-gray-800 dark:text-gray-200">{children}</div>
    </section>
);


const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('helpPage.title')}
      </h2>

      <div className="space-y-10">
        <HelpSection title={t('helpPage.introduction')}>
            <p>{t('helpPage.introductionBody')}</p>
        </HelpSection>

        <HelpSection title={t('helpPage.howItWorks')}>
            <div>
                <h4 className="font-bold">{t('helpPage.step1Title')}</h4>
                <p>{t('helpPage.step1Body')}</p>
            </div>
             <div>
                <h4 className="font-bold">{t('helpPage.step2Title')}</h4>
                <p>{t('helpPage.step2Body')}</p>
            </div>
             <div>
                <h4 className="font-bold">{t('helpPage.step3Title')}</h4>
                <p>{t('helpPage.step3Body')}</p>
            </div>
             <div>
                <h4 className="font-bold">{t('helpPage.step4Title')}</h4>
                <p>{t('helpPage.step4Body')}</p>
            </div>
        </HelpSection>

        <HelpSection title={t('helpPage.faq')}>
            <div className="space-y-4">
                <FaqItem question={t('helpPage.q1')} answer={t('helpPage.a1')} />
                <FaqItem question={t('helpPage.q2')} answer={t('helpPage.a2')} />
                <FaqItem question={t('helpPage.q3')} answer={t('helpPage.a3')} />
            </div>
        </HelpSection>
      </div>

       <div className="mt-10 text-center">
            <button onClick={onBack} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
                {t('helpPage.backButton')}
            </button>
      </div>
    </div>
  );
};

export default HelpPage;
