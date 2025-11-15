import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LightbulbIcon } from './Icons';

interface HelpPageProps {
  onBack: () => void;
}

const FaqItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => (
  <details className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-indigo-500 dark:hover:border-indigo-400">
    <summary className="font-semibold cursor-pointer text-indigo-700 dark:text-indigo-300">
      {question}
    </summary>
    <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
      {answer}
    </p>
  </details>
);

const TipItem: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
    <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-300 mt-1">
      <LightbulbIcon className="w-6 h-6" />
    </div>
    <div>
      <h4 className="font-bold text-indigo-800 dark:text-indigo-200">
        {title}
      </h4>
      <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
        {body}
      </p>
    </div>
  </div>
);

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section>
    <h3 className="text-2xl font-bold mb-4 border-b-2 border-indigo-500 pb-2">
      {title}
    </h3>
    <div className="space-y-4 text-gray-800 dark:text-gray-200">
      {children}
    </div>
  </section>
);

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('helpPage.title')}
      </h2>

      <div className="space-y-12">
        <HelpSection title={t('helpPage.introduction.title')}>
          <p className="leading-relaxed">{t('helpPage.introduction.body')}</p>
        </HelpSection>

        <HelpSection title={t('helpPage.workflow.title')}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.workflow.step1.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.workflow.step1.body')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.workflow.step2.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.workflow.step2.body')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.workflow.step3.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.workflow.step3.body')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.workflow.step4.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.workflow.step4.body')}
              </p>
            </div>
          </div>
        </HelpSection>

        <HelpSection title={t('helpPage.settings.title')}>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.settings.generation.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.settings.generation.body')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.settings.layout.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.settings.layout.body')}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('helpPage.settings.bubbles.title')}
              </h4>
              <p className="leading-relaxed">
                {t('helpPage.settings.bubbles.body')}
              </p>
            </div>
          </div>
        </HelpSection>

        <HelpSection title={t('helpPage.tips.title')}>
          <div className="space-y-4">
            <TipItem
              title={t('helpPage.tips.tip1.title')}
              body={t('helpPage.tips.tip1.body')}
            />
            <TipItem
              title={t('helpPage.tips.tip2.title')}
              body={t('helpPage.tips.tip2.body')}
            />
            <TipItem
              title={t('helpPage.tips.tip3.title')}
              body={t('helpPage.tips.tip3.body')}
            />
            <TipItem
              title={t('helpPage.tips.tip4.title')}
              body={t('helpPage.tips.tip4.body')}
            />
          </div>
        </HelpSection>

        <HelpSection title={t('helpPage.faq.title')}>
          <div className="space-y-4">
            <FaqItem
              question={t('helpPage.faq.q1')}
              answer={t('helpPage.faq.a1')}
            />
            <FaqItem
              question={t('helpPage.faq.q2')}
              answer={t('helpPage.faq.a2')}
            />
            <FaqItem
              question={t('helpPage.faq.q3')}
              answer={t('helpPage.faq.a3')}
            />
            <FaqItem
              question={t('helpPage.faq.q4')}
              answer={t('helpPage.faq.a4')}
            />
          </div>
        </HelpSection>

        <HelpSection title={t('helpPage.technical.title')}>
          <p className="leading-relaxed text-sm p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
            {t('helpPage.technical.body')}
          </p>
        </HelpSection>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
        >
          {t('helpPage.backButton')}
        </button>
      </div>
    </div>
  );
};

export default HelpPage;
