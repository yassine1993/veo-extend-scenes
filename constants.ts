
import { VeoModel, Resolution, AspectRatio } from './types';

export const VEO_MODELS: { value: VeoModel; label: string }[] = [
  { value: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast' },
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1' },
];

export const RESOLUTIONS: { value: Resolution; label: string }[] = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
];

export const LOADING_MESSAGES: string[] = [
  "Summoning digital actors...",
  "Directing pixel performance...",
  "Rendering the virtual set...",
  "Adjusting the digital lighting...",
  "Finalizing the cinematic score...",
  "This can take a few minutes, please wait...",
  "The AI is deep in creative thought...",
  "Composing your visual masterpiece...",
];
