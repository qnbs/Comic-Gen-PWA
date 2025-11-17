import React from 'react';
import { UploadCloudIcon } from '../Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface FileUploadProps {
  onDataExtracted: (data: { title: string; text: string; error?: string | null }) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataExtracted }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const processFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || '';
        const title = selectedFile.name.replace(/\.txt$/, '');
        onDataExtracted({ text, title });
        setFile(selectedFile);
      };
      reader.onerror = () => onDataExtracted({ title: '', text: '', error: t('importer.readFileError') });
      reader.readAsText(selectedFile);
    } else {
      onDataExtracted({ title: '', text: '', error: t('importer.uploadError') });
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 text-center ${
          isDragging
            ? 'border-indigo-500 bg-gray-100 dark:bg-gray-700/50'
            : 'border-gray-400 dark:border-gray-600 hover:border-indigo-500'
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileChange} className="hidden" />
        <UploadCloudIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">
          {file ? file.name : t('importer.dragAndDrop')}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('importer.uploadHint')}</p>
      </div>
    </div>
  );
};

export default FileUpload;