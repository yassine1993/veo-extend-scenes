
import { GoogleGenAI } from '@google/genai';
import { VeoModel, Resolution, AspectRatio } from '../types';

interface Scene1Params {
  prompt: string;
  model: VeoModel;
  resolution: Resolution;
  aspectRatio: AspectRatio;
}

interface Scene2Params {
  prompt: string;
  model: VeoModel;
  resolution: Resolution;
  previousOperation: any;
}

const POLLING_INTERVAL = 10000; // 10 seconds

const fetchVideoAndCreateObjectURL = async (downloadLink: string, apiKey: string): Promise<string> => {
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch video file: ${response.status} ${response.statusText}`);
  }
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
}

export const generateScene1 = async (params: Scene1Params) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const apiKey = process.env.API_KEY;

  const ai = new GoogleGenAI({ apiKey });
  let operation = await ai.models.generateVideos({
    model: params.model,
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      resolution: params.resolution,
      aspectRatio: params.aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
    throw new Error(operation.error.message || 'Video generation failed in operation.');
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Could not retrieve video URI from the generation result.');
  }

  const videoUrl = await fetchVideoAndCreateObjectURL(downloadLink, apiKey);
  return { videoUrl, operation };
};

export const generateScene2 = async (params: Scene2Params) => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  const apiKey = process.env.API_KEY;

  const previousVideo = params.previousOperation.response?.generatedVideos?.[0]?.video;
  if (!previousVideo) {
    throw new Error("Could not find video data from the Scene 1 operation.");
  }

  const ai = new GoogleGenAI({ apiKey });
  let operation = await ai.models.generateVideos({
    model: params.model,
    prompt: params.prompt,
    video: previousVideo,
    config: {
      numberOfVideos: 1,
      resolution: params.resolution,
      aspectRatio: previousVideo.aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  if (operation.error) {
    throw new Error(operation.error.message || 'Video generation failed in operation.');
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Could not retrieve video URI from the generation result.');
  }

  const videoUrl = await fetchVideoAndCreateObjectURL(downloadLink, apiKey);
  return { videoUrl, operation };
};
