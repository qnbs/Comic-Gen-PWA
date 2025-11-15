import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon, LinkIcon, LibraryIcon, SaveIcon, TrashIcon } from './Icons';
import { publicBooks } from '../services/publicBooks';
import { useTranslation } from '../hooks/useTranslation';
import type { SavedProgress } from '../types';

interface BookImporterProps {
  onGenerate: (text: string) => void;
  savedProgress: SavedProgress | null;
  onResume: () => void;
  onDiscard: () => void;
}

type ImportMode = 'upload' | 'url' | 'browse';

// Component for the "Upload File" tab
const UploadPanel: React.FC<{ onGenerate: (text: string) => void }> = ({ onGenerate }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'text/plain' && selectedFile.size <= 50000) { // 50KB limit
                setFile(selectedFile);
                setError(null);
            } else {
                setError(t('importer.uploadError'));
                setFile(null);
            }
        }
    };

    const handleSubmit = useCallback(() => {
        if (!file) {
            setError(t('importer.selectFileError'));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            onGenerate(text);
        };
        reader.onerror = () => {
            setError(t('importer.readFileError'));
        }
        reader.readAsText(file);
    }, [file, onGenerate, t]);
    
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'text/plain' && droppedFile.size <= 50000) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError(t('importer.uploadError'));
                setFile(null);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-500 bg-gray-100 dark:bg-gray-700/50' : 'border-gray-400 dark:border-gray-600 hover:border-indigo-500'}`}
            >
                <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
                <UploadCloudIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{file ? file.name : t('importer.dragAndDrop')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('importer.uploadHint')}</p>
            </div>
            {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
            <button
                onClick={handleSubmit}
                disabled={!file}
                className="mt-6 w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {t('importer.generate')}
            </button>
        </div>
    );
};

// Component for the "Import from URL" tab
const UrlPanel: React.FC<{ onGenerate: (text: string) => void }> = ({ onGenerate }) => {
    const [text, setText] = useState('');
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{t('importer.urlDescription')}</p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('importer.pastePlaceholder')}
                className="w-full h-40 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
                onClick={() => onGenerate(text)}
                disabled={!text.trim()}
                className="mt-6 w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {t('importer.generate')}
            </button>
        </div>
    );
}

// Component for the "Browse Library" tab
const BrowsePanel: React.FC<{ onGenerate: (text: string) => void }> = ({ onGenerate }) => {
    const { t } = useTranslation();
    return (
        <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">{t('importer.browseDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicBooks.map(book => (
                    <div key={book.title}
                        onClick={() => onGenerate(book.text)}
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    >
                        <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-300">{book.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('importer.by')} {book.author}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{book.text.substring(0, 100)}..."</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const BookImporter: React.FC<BookImporterProps> = ({ onGenerate, savedProgress, onResume, onDiscard }) => {
    const [mode, setMode] = useState<ImportMode>('browse');
    const { t } = useTranslation();

    const renderPanel = () => {
        switch (mode) {
            case 'upload': return <UploadPanel onGenerate={onGenerate} />;
            case 'url': return <UrlPanel onGenerate={onGenerate} />;
            case 'browse': return <BrowsePanel onGenerate={onGenerate} />;
            default: return null;
        }
    };

    const TabButton: React.FC<{ activeMode: ImportMode, targetMode: ImportMode, children: React.ReactNode, icon: React.ReactNode }> = ({ activeMode, targetMode, children, icon }) => (
        <button
            onClick={() => setMode(targetMode)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeMode === targetMode 
                ? 'text-indigo-600 dark:text-indigo-400 border-indigo-500 dark:border-indigo-400' 
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500'
            }`}
        >
            {icon}
            {children}
        </button>
    );

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl overflow-hidden">
             {savedProgress && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 border-b border-indigo-200 dark:border-indigo-700 text-center">
                    <h3 className="font-bold text-lg text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2"><SaveIcon className="w-5 h-5" />{t('app.resume.title')}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 mb-4">{t('app.resume.body', { date: new Date(savedProgress.timestamp).toLocaleString() })}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onResume} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition-colors">{t('app.resume.resumeButton')}</button>
                        <button onClick={onDiscard} className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"><TrashIcon className="w-4 h-4"/>{t('app.resume.discardButton')}</button>
                    </div>
                </div>
            )}
            <div className="flex border-b border-gray-300 dark:border-gray-700">
                <TabButton activeMode={mode} targetMode="browse" icon={<LibraryIcon className="w-5 h-5"/>}>{t('importer.tabBrowse')}</TabButton>
                <TabButton activeMode={mode} targetMode="url" icon={<LinkIcon className="w-5 h-5"/>}>{t('importer.tabUrl')}</TabButton>
                <TabButton activeMode={mode} targetMode="upload" icon={<UploadCloudIcon className="w-5 h-5"/>}>{t('importer.tabUpload')}</TabButton>
            </div>
            <div className="p-8">
                {renderPanel()}
            </div>
        </div>
    );
};

export default BookImporter;