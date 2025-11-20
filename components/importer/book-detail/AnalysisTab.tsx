import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { analyzeBookForWordCloud } from '../../../features/gutenbergSlice';
import type { WordCloudEntry, LibraryBook } from '../../../types';
import cloud from 'd3-cloud';
import { addToast } from '../../../features/uiSlice';
import { SparklesIcon } from '../../Icons';

const WordCloud: React.FC<{
  words: WordCloudEntry[];
  onWordClick: (word: string) => void;
}> = React.memo(({ words, onWordClick }) => {
  const ref = React.useRef<SVGSVGElement>(null);
  const [layoutWords, setLayoutWords] = React.useState<cloud.Word[]>([]);

  React.useEffect(() => {
    if (words.length === 0) return;

    const layout = cloud()
      .size([500, 300])
      .words(words.map((d) => ({ text: d.text, size: d.size })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('Impact')
      .fontSize((d) => d.size!)
      .on('end', (words) => {
        setLayoutWords(words);
      });

    layout.start();
  }, [words]);

  const fill = () => {
    const colors = ['#4f46e5', '#7c3aed', '#a855f7', '#ec4899', '#f43f5e'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="flex justify-center">
      <svg ref={ref} width="500" height="300">
        <g transform="translate(250,150)">
          {layoutWords.map((word, i) => (
            <text
              key={i}
              fontFamily={word.font}
              fontSize={word.size}
              fill={fill()}
              textAnchor="middle"
              transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
              className="cursor-pointer transition-opacity hover:opacity-75"
              onClick={() => onWordClick(word.text!)}
            >
              {word.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
});

interface AnalysisTabProps {
  book: LibraryBook;
  onWordClick: (word: string) => void;
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({ book, onWordClick }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { analysisStatus } = useAppSelector((state) => state.libraryBrowser);
  const isAnalyzing = analysisStatus[book.id] === 'loading';

  const handleStartAnalysis = () => {
    dispatch(analyzeBookForWordCloud(book.id))
      .unwrap()
      .then(() => {
        dispatch(addToast({ message: 'Analysis complete!', type: 'success' }));
      })
      .catch((error: unknown) => {
        dispatch(addToast({ message: String(error), type: 'error' }));
      });
  };

  return (
    <div>
      <h3 className="font-bold mb-2">{t('bookDetail.wordCloudAnalysis')}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('bookDetail.wordCloudDescription')}
      </p>
      {!book.analysisCache && (
        <button
          onClick={handleStartAnalysis}
          disabled={isAnalyzing}
          className="mb-4 px-5 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              {t('bookDetail.generatingAnalysis')}
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              {t('bookDetail.generateAnalysis')}
            </>
          )}
        </button>
      )}
      {book.analysisCache && (
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold">{t('bookDetail.overallWork')}</h4>
            <WordCloud words={book.analysisCache.overall} onWordClick={onWordClick} />
          </div>
          <div>
            <h4 className="font-semibold">{t('bookDetail.keyCharacters')}</h4>
            {book.analysisCache.characters.map((c) => (
              <div key={c.name} className="mt-2">
                <h5 className="text-sm font-medium italic text-gray-600 dark:text-gray-400">{c.name}</h5>
                <WordCloud words={c.words} onWordClick={onWordClick}/>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold">{t('bookDetail.keyLocations')}</h4>
            {book.analysisCache.locations.map((l) => (
              <div key={l.name} className="mt-2">
                <h5 className="text-sm font-medium italic text-gray-600 dark:text-gray-400">{l.name}</h5>
                <WordCloud words={l.words} onWordClick={onWordClick}/>
              </div>
            ))}
          </div>
          <div>
            <h4 className="font-semibold">{t('bookDetail.keyEvents')}</h4>
            {book.analysisCache.events.map((e) => (
              <div key={e.name} className="mt-2">
                <h5 className="text-sm font-medium italic text-gray-600 dark:text-gray-400">{e.name}</h5>
                <WordCloud words={e.words} onWordClick={onWordClick}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisTab;
