'use client';

import React from 'react';

interface ModelPreferencesModalProps {
  open: boolean;
  selected: string[];
  onChange: (models: string[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function ModelPreferencesModal({
  open,
  selected,
  onChange,
  onClose,
  onSave
}: ModelPreferencesModalProps) {
  if (!open) return null;

  const availableModels = [
    'gpt-5',
    'claude-4-sonnet',
    'google',
    'meta-llama',
    'deepseek',
    'perplexity',
    'grok',
    'perplexity-pro',
    'mistral'
  ];

  const handleModelToggle = (model: string) => {
    if (selected.includes(model)) {
      onChange(selected.filter(m => m !== model));
    } else {
      onChange([...selected, model]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Select AI Models
        </h2>

        <div className="space-y-2 mb-6">
          {availableModels.map((model) => (
            <label key={model} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(model)}
                onChange={() => handleModelToggle(model)}
                className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="capitalize text-slate-700 dark:text-slate-300">
                {model}
              </span>
            </label>
          ))}
        </div>

        <div className="flex space-x-6">
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-violet-700 hover:to-purple-800 transition-all duration-200"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
