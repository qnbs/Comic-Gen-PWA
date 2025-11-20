import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch } from '../../../app/hooks';
import { updateBookMetadata } from '../../../features/gutenbergSlice';
import type { LibraryBook } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';
import { DownloadIcon, PencilIcon, XIcon } from '../../Icons';

interface ReaderTabProps {
  book: LibraryBook;
  wordToHighlight: string;
  clearHighlight: () => void;
}

const ReaderTab: React.FC<ReaderTabProps> = ({ book, wordToHighlight, clearHighlight }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(book.fullText || '');

  const debouncedText = useDebounce(editedText, 1500);
  const firstMarkRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isEditing && debouncedText !== (book.fullText || '')) {
      dispatch(updateBookMetadata({ bookId: book.id, updates: { fullText: debouncedText } }));
    }
  }, [debouncedText, book, isEditing, dispatch]);

  useEffect(() => {
      setEditedText(book.fullText || '');
  }, [book.fullText]);

  useEffect(() => {
    if (wordToHighlight && firstMarkRef.current) {
        firstMarkRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [wordToHighlight]);

  const highlightedContent = useMemo(() => {
    if (!wordToHighlight) return editedText;
    const parts = editedText.split(new RegExp(`(${wordToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    let isFirst = true;
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === wordToHighlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5"
              ref={isFirst ? (isFirst = false, firstMarkRef) : null}
            >
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  }, [editedText, wordToHighlight]);

  const exportTxt = () => {
    const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/ /g, '_') || 'export'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                >
                    {isEditing ? <XIcon className="w-5 h-5"/> : <PencilIcon className="w-5 h-5" />}
                    {isEditing ? 'Cancel' : 'Edit Text'}
                </button>
                 <button onClick={exportTxt} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    Export .txt
                 </button>
            </div>
            {wordToHighlight && (
                <div className="flex items-center gap-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                    <span>Highlighting: <span className="font-semibold">{wordToHighlight}</span></span>
                    <button onClick={clearHighlight} className="p-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"><XIcon className="w-4 h-4" /></button>
                </div>
            )}
        </div>
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full h-96 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-indigo-500 font-mono text-sm"
        />
      ) : (
        <div className="w-full h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-4 prose dark:prose-invert prose-sm max-w-none">
            <p style={{ whiteSpace: 'pre-wrap' }}>
                {highlightedContent}
            </p>
        </div>
      )}
    </div>
  );
};

export default ReaderTab;