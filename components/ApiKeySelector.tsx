
import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume success and update state to allow the app to proceed.
        // This mitigates a potential race condition where hasSelectedApiKey isn't immediately true.
        onKeySelected();
      } catch (error) {
        console.error("Error opening API key selection dialog:", error);
      }
    } else {
        console.error("aistudio.openSelectKey is not available.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4">API Key Required</h2>
        <p className="text-gray-400 mb-6">
          To use the Veo video generation models, you must select an API key. 
          This is a mandatory step.
        </p>
        <button
          onClick={handleSelectKey}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-100"
        >
          Select Your API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          For more information on billing, please visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            official documentation
          </a>.
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelector;
