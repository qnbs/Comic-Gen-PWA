import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAppDispatch } from '../../../app/hooks';
import { updateBookMetadata } from '../../../features/gutenbergSlice';
import type { LibraryBook } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';

interface MetadataTabProps {
  book: LibraryBook;
}

const MetadataTab: React.FC<MetadataTabProps> = ({ book }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [notes, setNotes] = useState(book.notes || '');
  const [tags, setTags] = useState(book.tags?.join(', ') || '');
  
  const debouncedNotes = useDebounce(notes, 1500);
  const debouncedTags = useDebounce(tags, 1500);

  useEffect(() => {
    // Check if the component is mounted and if there is a book.
    if (!book) return;

    const updates: Partial<Pick<LibraryBook, 'notes' | 'tags'>> = {};
    const hasNotesChanged = debouncedNotes !== (book.notes || '');
    const hasTagsChanged = debouncedTags !== (book.tags?.join(', ') || '');

    if (hasNotesChanged) {
        updates.notes = debouncedNotes;
    }
    if (hasTagsChanged) {
        updates.tags = debouncedTags.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    if (Object.keys(updates).length > 0) {
        dispatch(updateBookMetadata({ bookId: book.id, updates }));
    }
  }, [debouncedNotes, debouncedTags, book, dispatch]);


  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="notes-editor"
          className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1"
        >
          {t('bookDetail.notes')}
        </label>
        <textarea
          id="notes-editor"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('bookDetail.notesPlaceholder')}
          rows={8}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label
          htmlFor="tags-editor"
          className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1"
        >
          {t('bookDetail.tags')}
        </label>
        <input
          id="tags-editor"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t('bookDetail.tagsPlaceholder')}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default MetadataTab;