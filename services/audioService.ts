import { SoundParams } from '../types';

class AudioService {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.initContext();
  }

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 2048;
      this.masterGain = this.context.createGain();
      
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser) this.initContext();
    return this.analyser;
  }

  public resumeContext() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  /**
   * Schedules the oscillator and gain nodes on a specific context (Realtime or Offline).
   */
  private scheduleSound(ctx: BaseAudioContext, destination: AudioNode, params: SoundParams, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = params.waveform;
    osc.frequency.setValueAtTime(params.frequency, startTime);
    
    // Frequency Sweep (exponential ramp usually sounds better for UI SFX, but linear is predictable)
    // If sweep is 0, no change. If sweep is positive, pitch goes up. Negative, pitch goes down.
    if (params.sweep !== 0) {
      const targetFreq = Math.max(10, params.frequency + params.sweep);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, startTime + params.decay);
    }

    // Gain Envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(params.volume, startTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + params.decay); // Decay

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + params.decay + 0.1);
  }

  /**
   * Plays the sound immediately on the main AudioContext.
   */
  public play(params: SoundParams) {
    this.initContext();
    if (!this.context || !this.masterGain) return;
    this.resumeContext();

    const now = this.context.currentTime;
    this.scheduleSound(this.context, this.masterGain, params, now);
  }

  /**
   * Renders the sound to an OfflineAudioContext and returns a WAV Blob.
   */
  public async generateWav(params: SoundParams): Promise<Blob> {
    // Duration needs to account for decay
    const duration = params.decay + 0.2; 
    const sampleRate = 44100;
    const offlineCtx = new OfflineAudioContext(1, sampleRate * duration, sampleRate);

    this.scheduleSound(offlineCtx, offlineCtx.destination, params, 0);

    const audioBuffer = await offlineCtx.startRendering();
    return this.bufferToWav(audioBuffer);
  }

  /**
   * Utility to convert AudioBuffer to WAV format
   */
  private bufferToWav(abuffer: AudioBuffer): Blob {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this example)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < abuffer.length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(offset, sample, true);          // write 16-bit sample
        offset += 2;
      }
      pos++;
    }

    // helper functions
    function setUint16(data: number) {
      view.setUint16(offset, data, true);
      offset += 2;
    }

    function setUint32(data: number) {
      view.setUint32(offset, data, true);
      offset += 4;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }
}

export const audioService = new AudioService();
