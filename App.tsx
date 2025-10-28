
import React, { useState, useEffect, useCallback } from 'react';
import { generateScene1, generateScene2 } from './services/geminiService';
import { VeoModel, Resolution, AspectRatio } from './types';
import { VEO_MODELS, RESOLUTIONS, ASPECT_RATIOS } from './constants';
import VideoPlayer from './components/VideoPlayer';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeySelector from './components/ApiKeySelector';
import { FilmIcon, XCircleIcon } from './components/icons';

const App: React.FC = () => {
  const [scene1Prompt, setScene1Prompt] = useState<string>('A majestic eagle soaring through a dramatic, stormy sky over a mountain range.');
  const [scene2Prompt, setScene2Prompt] = useState<string>('The eagle dives down, landing gracefully on a craggy peak as the storm begins to subside and sunlight breaks through the clouds.');
  
  const [veoModel, setVeoModel] = useState<VeoModel>('veo-3.1-fast-generate-preview');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [scene2VeoModel, setScene2VeoModel] = useState<VeoModel>('veo-3.1-generate-preview');
  const [scene2Resolution, setScene2Resolution] = useState<Resolution>('720p');


  const [scene1VideoUrl, setScene1VideoUrl] = useState<string | null>(null);
  const [scene2VideoUrl, setScene2VideoUrl] = useState<string | null>(null);

  const [isLoadingScene1, setIsLoadingScene1] = useState<boolean>(false);
  const [isLoadingScene2, setIsLoadingScene2] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [scene1Operation, setScene1Operation] = useState<any | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleKeySelected = useCallback(() => {
    setApiKeySelected(true);
  }, []);

  const handleGenerateScene1 = async () => {
    if (!scene1Prompt.trim()) {
      setError('Scene 1 prompt cannot be empty.');
      return;
    }
    setError(null);
    setIsLoadingScene1(true);
    setScene1VideoUrl(null);
    setScene2VideoUrl(null);
    setScene1Operation(null);

    try {
      const result = await generateScene1({ prompt: scene1Prompt, model: veoModel, resolution, aspectRatio });
      setScene1VideoUrl(result.videoUrl);
      setScene1Operation(result.operation);
      // Automatically set the correct model for Scene 2 continuation, as it's a requirement.
      setScene2VeoModel('veo-3.1-generate-preview');
       if (resolution !== '720p') {
        setError("Hint: Scene 1 was generated at 1080p. To create a direct continuation, Scene 1 must be generated at 720p.");
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(`Scene 1 generation failed: ${errorMessage}`);
      if (errorMessage.includes("Requested entity was not found.")) {
        setApiKeySelected(false);
      }
    } finally {
      setIsLoadingScene1(false);
    }
  };

  const handleGenerateScene2 = async () => {
    if (!scene2Prompt.trim()) {
      setError('Scene 2 prompt cannot be empty.');
      return;
    }
    if (!scene1Operation) {
      setError('Scene 1 must be generated before Scene 2.');
      return;
    }
    
    // Consolidated client-side validation for API requirements
    const validationErrors = [];
    if (resolution !== '720p') {
      validationErrors.push('Scene 1 must be 720p.');
    }
    if (scene2VeoModel !== 'veo-3.1-generate-preview') {
      validationErrors.push("Scene 2 must use the 'Veo 3.1' model.");
    }
    if (scene2Resolution !== '720p') {
        validationErrors.push("Scene 2 must use '720p' resolution.");
    }
    
    if (validationErrors.length > 0) {
        setError(`Continuation requirements not met: ${validationErrors.join(' ')}`);
        return;
    }

    setError(null);
    setIsLoadingScene2(true);
    setScene2VideoUrl(null);

    try {
      const result = await generateScene2({ 
        prompt: scene2Prompt,
        model: scene2VeoModel,
        resolution: scene2Resolution,
        previousOperation: scene1Operation 
      });
      setScene2VideoUrl(result.videoUrl);
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(`Scene 2 generation failed: ${errorMessage}`);
       if (errorMessage.includes("Requested entity was not found.")) {
        setApiKeySelected(false);
      }
    } finally {
      setIsLoadingScene2(false);
    }
  };

  if (!apiKeySelected) {
    return <ApiKeySelector onKeySelected={handleKeySelected} />;
  }
  
  const isScene2Locked = !scene1VideoUrl || isLoadingScene1 || isLoadingScene2;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <FilmIcon className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              Veo Continuity Studio
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-400">Generate continuous video scenes with Google's Veo 3.1 model.</p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 flex justify-between items-center" role="alert">
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50">
                <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Column */}
          <div className="flex flex-col gap-8">
            {/* Scene 1 */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Scene 1: The Opener</h2>
              <div className="space-y-4">
                <textarea
                  value={scene1Prompt}
                  onChange={(e) => setScene1Prompt(e.target.value)}
                  placeholder="Describe the first scene..."
                  className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  disabled={isLoadingScene1 || isLoadingScene2}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SelectControl label="Model" value={veoModel} onChange={(e) => setVeoModel(e.target.value as VeoModel)} options={VEO_MODELS} disabled={isLoadingScene1 || isLoadingScene2} />
                  <SelectControl label="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)} options={RESOLUTIONS} disabled={isLoadingScene1 || isLoadingScene2} />
                  <SelectControl label="Aspect Ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} options={ASPECT_RATIOS} disabled={isLoadingScene1 || isLoadingScene2} />
                </div>
                <button
                  onClick={handleGenerateScene1}
                  disabled={isLoadingScene1 || isLoadingScene2}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoadingScene1 ? 'Generating...' : 'Generate Scene 1'}
                </button>
              </div>
            </div>

            {/* Scene 2 */}
            <div className={`bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-2xl backdrop-blur-sm transition-opacity duration-500 ${isScene2Locked ? 'opacity-50' : 'opacity-100'}`}>
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">Scene 2: The Continuation</h2>
              <div className="space-y-4">
                <textarea
                  value={scene2Prompt}
                  onChange={(e) => setScene2Prompt(e.target.value)}
                  placeholder="Describe the continuation of Scene 1..."
                  className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  disabled={isScene2Locked}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SelectControl label="Model" value={scene2VeoModel} onChange={(e) => setScene2VeoModel(e.target.value as VeoModel)} options={VEO_MODELS} disabled={isScene2Locked || !!scene1VideoUrl} />
                    <SelectControl label="Resolution" value={scene2Resolution} onChange={(e) => setScene2Resolution(e.target.value as Resolution)} options={RESOLUTIONS} disabled={isScene2Locked} />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Aspect Ratio</label>
                        <div className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-300 h-[42px] flex items-center">
                          {ASPECT_RATIOS.find(r => r.value === aspectRatio)?.label}
                        </div>
                    </div>
                </div>
                <div className='space-y-2 text-sm'>
                  {scene1VideoUrl && (
                      <p className="text-yellow-300 p-3 rounded-md bg-gray-700/50 border border-yellow-800/50">
                          <strong>API Requirement:</strong> The 'Veo 3.1' model is required for video continuation and has been automatically selected.
                      </p>
                  )}
                  <p className="text-gray-400">
                      For a successful continuation: Scene 1 must be 720p, and Scene 2 must also use 720p and match Scene 1's aspect ratio.
                  </p>
                </div>
                <button
                  onClick={handleGenerateScene2}
                  disabled={isScene2Locked}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoadingScene2 ? 'Generating...' : 'Generate Scene 2'}
                </button>
              </div>
            </div>
          </div>

          {/* Videos Column */}
          <div className="flex flex-col gap-8">
            <VideoPlayer title="Scene 1" src={scene1VideoUrl} isLoading={isLoadingScene1} />
            <VideoPlayer title="Scene 2" src={scene2VideoUrl} isLoading={isLoadingScene2} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SelectControlProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}

const SelectControl: React.FC<SelectControlProps> = ({ label, value, onChange, options, disabled }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <select value={value} onChange={onChange} disabled={disabled} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:opacity-70 h-[42px]">
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

export default App;
