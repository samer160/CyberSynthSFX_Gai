export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface SoundParams {
  frequency: number;   // Base frequency in Hz
  decay: number;       // Decay time in seconds
  waveform: WaveformType;
  sweep: number;       // Frequency sweep amount (Hz)
  volume: number;      // Master volume (0-1)
}

export interface Preset {
  name: string;
  id: string;
  params: SoundParams;
  color: 'cyan' | 'pink' | 'yellow';
}