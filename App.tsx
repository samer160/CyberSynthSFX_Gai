import React, { useState, useCallback } from 'react';
import { audioService } from './services/audioService';
import { SoundParams, Preset } from './types';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';

// Presets Definition
const PRESETS: Preset[] = [
  {
    id: 'click',
    name: '清脆点击 // CLICK',
    color: 'cyan',
    params: { frequency: 800, decay: 0.1, waveform: 'sine', sweep: -200, volume: 0.5 }
  },
  {
    id: 'success',
    name: '成功提示 // SUCCESS',
    color: 'pink',
    params: { frequency: 440, decay: 0.6, waveform: 'triangle', sweep: 440, volume: 0.5 }
  },
  {
    id: 'error',
    name: '错误警告 // ERROR',
    color: 'yellow',
    params: { frequency: 150, decay: 0.4, waveform: 'sawtooth', sweep: -50, volume: 0.5 }
  }
];

const App: React.FC = () => {
  const [params, setParams] = useState<SoundParams>(PRESETS[0].params);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlay = useCallback(() => {
    audioService.play(params);
  }, [params]);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    try {
      const blob = await audioService.generateWav(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersynth_${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Export failed. Check console.");
    } finally {
      setIsGenerating(false);
    }
  }, [params]);

  const applyPreset = (preset: Preset) => {
    setParams({ ...preset.params });
    // Play immediately on preset select for feedback
    audioService.play(preset.params);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-lg relative group">
        
        {/* Glowing Border Background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-[#111] ring-1 ring-white/10 rounded-lg p-6 md:p-8 shadow-2xl">
          
          {/* Header */}
          <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
            <div>
              <h1 
                className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 cyber-glitch" 
                data-text="CYBERSYNTH"
              >
                CYBERSYNTH
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-mono tracking-widest">UI SFX GENERATOR // V1.0</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
              <span className="text-[10px] text-green-500 font-mono mt-1">ONLINE</span>
            </div>
          </header>

          {/* Visualizer */}
          <Visualizer />

          {/* Controls */}
          <div className="bg-[#1a1a1a] p-4 rounded border border-gray-800 mb-6 relative overflow-hidden">
             {/* Decorative corner markers */}
             <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
             <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

            <Controls params={params} onChange={setParams} />
          </div>

          {/* Presets */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`
                  relative overflow-hidden py-3 px-2 border transition-all duration-300 group/btn
                  ${preset.color === 'cyan' ? 'border-cyan-900 hover:border-cyan-400 text-cyan-500' : ''}
                  ${preset.color === 'pink' ? 'border-pink-900 hover:border-pink-400 text-pink-500' : ''}
                  ${preset.color === 'yellow' ? 'border-yellow-900 hover:border-yellow-400 text-yellow-500' : ''}
                  bg-[#0f0f0f]
                `}
              >
                <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-10 bg-${preset.color}-500 transition-opacity`}></div>
                <span className="text-xs font-bold font-mono relative z-10">{preset.name.split(' // ')[0]}</span>
                <span className="block text-[9px] opacity-50 font-mono relative z-10">{preset.name.split(' // ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handlePlay}
              className="group relative flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded transition-all active:scale-95 border border-gray-600"
            >
               <span className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></span>
               PLAY
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_30px_rgba(219,39,119,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  DOWNLOAD .WAV
                </>
              )}
            </button>
          </div>

        </div>
        
        {/* Footer/Decoration */}
        <div className="mt-4 text-center">
            <div className="inline-block px-4 py-1 border border-white/5 rounded-full bg-black/40 backdrop-blur-sm">
                <span className="text-[10px] text-gray-600 font-mono">SYSTEM READY // WAITING FOR INPUT</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;
