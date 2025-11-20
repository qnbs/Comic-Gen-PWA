import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  BookOpenIcon,
  CogIcon,
  HelpCircleIcon,
  LightbulbIcon,
  SparklesIcon,
  Wand2Icon,
  XCircleIcon,
  ArchiveIcon,
} from './Icons';
import { TranslationKeys } from '../services/translations';

interface HelpPageProps {
  onBack: () => void;
}

const FaqItem: React.FC<{ qKey: TranslationKeys; aKey: TranslationKeys }> = ({
  qKey,
  aKey,
}) => {
  const { t } = useTranslation();
  return (
    <details className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-indigo-500 dark:hover:border-indigo-400 group">
      <summary className="font-semibold cursor-pointer text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200">
        {t(qKey)}
      </summary>
      <p className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
        {t(aKey)}
      </p>
    </details>
  );
};

const InfoBox: React.FC<{
  titleKey: TranslationKeys;
  bodyKey: TranslationKeys;
  icon: React.ReactNode;
}> = ({ titleKey, bodyKey, icon }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700">
      <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-300 mt-1">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-indigo-800 dark:text-indigo-200">
          {t(titleKey)}
        </h4>
        <p className="text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {t(bodyKey)}
        </p>
      </div>
    </div>
  );
};

const HelpSection: React.FC<{
  id: string;
  titleKey: TranslationKeys;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, titleKey, icon, children }) => {
  const { t } = useTranslation();
  return (
    <section id={id} className="scroll-mt-20">
      <h3 className="flex items-center gap-3 text-2xl font-bold mb-4 border-b-2 border-indigo-500 dark:border-indigo-400 pb-2 text-gray-900 dark:text-white">
        {icon}
        {t(titleKey)}
      </h3>
      <div className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const sections = [
    { id: 'introduction', titleKey: 'helpPage.introduction.title', icon: <SparklesIcon className="w-6 h-6" /> },
    { id: 'workflow', titleKey: 'helpPage.workflow.title', icon: <BookOpenIcon className="w-6 h-6" /> },
    { id: 'advanced-techniques', titleKey: 'helpPage.advanced.title', icon: <Wand2Icon className="w-6 h-6" /> },
    { id: 'hybrid-engine', titleKey: 'helpPage.engine.title', icon: <CogIcon className="w-6 h-6" /> },
    { id: 'faq', titleKey: 'helpPage.faq.title', icon: <HelpCircleIcon className="w-6 h-6" /> },
    { id: 'troubleshooting', titleKey: 'helpPage.troubleshooting.title', icon: <XCircleIcon className="w-6 h-6" /> },
    { id: 'technical-snapshot', titleKey: 'helpPage.technical.title', icon: <ArchiveIcon className="w-6 h-6" /> },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500">
        {t('helpPage.title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 hidden md:block">
          <nav className="sticky top-24">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">{t('helpPage.quickLinks')}</h4>
            <ul className="space-y-2">
              {sections.map(section => (
                  <li key={section.id}>
                      <a href={`#${section.id}`} onClick={handleLinkClick} className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors border-l-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 pl-3 block">
                          {t(section.titleKey as TranslationKeys)}
                      </a>
                  </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="md:col-span-3 space-y-12">
          <HelpSection id="introduction" titleKey="helpPage.introduction.title" icon={<SparklesIcon className="w-6 h-6" />}>
            <p>{t('helpPage.introduction.body')}</p>
          </HelpSection>

          <HelpSection id="workflow" titleKey="helpPage.workflow.title" icon={<BookOpenIcon className="w-6 h-6" />}>
             <InfoBox titleKey="helpPage.workflow.step1.title" bodyKey="helpPage.workflow.step1.body" icon={<span className="font-bold text-xl">1</span>} />
             <InfoBox titleKey="helpPage.workflow.step2.title" bodyKey="helpPage.workflow.step2.body" icon={<span className="font-bold text-xl">2</span>} />
             <InfoBox titleKey="helpPage.workflow.step3.title" bodyKey="helpPage.workflow.step3.body" icon={<span className="font-bold text-xl">3</span>} />
             <InfoBox titleKey="helpPage.workflow.step4.title" bodyKey="helpPage.workflow.step4.body" icon={<span className="font-bold text-xl">4</span>} />
             <InfoBox titleKey="helpPage.workflow.step5.title" bodyKey="helpPage.workflow.step5.body" icon={<span className="font-bold text-xl">5</span>} />
          </HelpSection>

          <HelpSection id="advanced-techniques" titleKey="helpPage.advanced.title" icon={<Wand2Icon className="w-6 h-6" />}>
              <InfoBox titleKey="helpPage.advanced.prompting.title" bodyKey="helpPage.advanced.prompting.body" icon={<LightbulbIcon className="w-6 h-6"/>} />
              <InfoBox titleKey="helpPage.advanced.consistency.title" bodyKey="helpPage.advanced.consistency.body" icon={<LightbulbIcon className="w-6 h-6"/>} />
              <InfoBox titleKey="helpPage.advanced.pacing.title" bodyKey="helpPage.advanced.pacing.body" icon={<LightbulbIcon className="w-6 h-6"/>} />
              <InfoBox titleKey="helpPage.advanced.posing.title" bodyKey="helpPage.advanced.posing.body" icon={<LightbulbIcon className="w-6 h-6"/>} />
          </HelpSection>
          
          <HelpSection id="hybrid-engine" titleKey="helpPage.engine.title" icon={<CogIcon className="w-6 h-6" />}>
              <p>{t('helpPage.engine.body')}</p>
          </HelpSection>

          <HelpSection id="faq" titleKey="helpPage.faq.title" icon={<HelpCircleIcon className="w-6 h-6" />}>
              <FaqItem qKey="helpPage.faq.q1" aKey="helpPage.faq.a1" />
              <FaqItem qKey="helpPage.faq.q2" aKey="helpPage.faq.a2" />
              <FaqItem qKey="helpPage.faq.q3" aKey="helpPage.faq.a3" />
              <FaqItem qKey="helpPage.faq.q4" aKey="helpPage.faq.a4" />
          </HelpSection>
          
          <HelpSection id="troubleshooting" titleKey="helpPage.troubleshooting.title" icon={<XCircleIcon className="w-6 h-6" />}>
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{t('helpPage.troubleshooting.api.title')}</h4>
            <p>{t('helpPage.troubleshooting.api.body')}</p>
            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mt-4">{t('helpPage.troubleshooting.consistency.title')}</h4>
            <p>{t('helpPage.troubleshooting.consistency.body')}</p>
          </HelpSection>
          
          <HelpSection id="technical-snapshot" titleKey="helpPage.technical.title" icon={<ArchiveIcon className="w-6 h-6" />}>
            <p className="text-sm p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700">
                {t('helpPage.technical.body')}
            </p>
          </HelpSection>
        </main>
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