import React from 'react';

interface PasteTextProps {
  onDataChange: (data: { title: string; text: string }) => void;
}

const PasteText: React.FC<PasteTextProps> = ({ onDataChange }) => {
  const [text, setText] = React.useState('');
  const [title, setTitle] = React.useState('');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onDataChange({ title: newTitle, text });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onDataChange({ title, text: newText });
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="project-title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Project Title
        </label>
        <input
          id="project-title"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g., Alice in Wonderland"
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label
          htmlFor="paste-area"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Paste Your Text
        </label>
        <textarea
          id="paste-area"
          value={text}
          onChange={handleTextChange}
          placeholder="Paste the full text of your story here..."
          className="w-full h-80 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default PasteText;
