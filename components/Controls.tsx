import React from 'react';
import { SoundParams, WaveformType } from '../types';

interface ControlsProps {
  params: SoundParams;
  onChange: (newParams: SoundParams) => void;
}

const Controls: React.FC<ControlsProps> = ({ params, onChange }) => {
  const handleChange = (key: keyof SoundParams, value: number | string) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-6">
        
      {/* Waveform Selector */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-pink-500 font-bold">Waveform // 波形</label>
        <div className="grid grid-cols-4 gap-2">
          {(['sine', 'square', 'triangle', 'sawtooth'] as WaveformType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleChange('waveform', type)}
              className={`
                h-10 text-xs font-bold uppercase transition-all duration-200 border
                ${params.waveform === type 
                  ? 'bg-pink-600 text-black border-pink-400 shadow-[0_0_10px_#db2777]' 
                  : 'bg-black/50 text-gray-400 border-gray-700 hover:border-pink-500 hover:text-pink-400'}
              `}
            >
              {type.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Frequency Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-cyan-400 font-mono text-sm">
          <span>FREQ // 频率</span>
          <span>{params.frequency} Hz</span>
        </div>
        <input
          type="range"
          min="50"
          max="2000"
          step="10"
          value={params.frequency}
          onChange={(e) => handleChange('frequency', Number(e.target.value))}
        />
      </div>

      {/* Sweep Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-cyan-400 font-mono text-sm">
            {/* Using a bit of Japanese/English mix for that cyberpunk feel as requested in prompt "cool" */}
          <span>SWEEP // 扫频</span>
          <span>{params.sweep > 0 ? '+' : ''}{params.sweep} Hz</span>
        </div>
        <input
          type="range"
          min="-1000"
          max="1000"
          step="50"
          value={params.sweep}
          onChange={(e) => handleChange('sweep', Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-gray-600 px-1">
            <span>Down</span>
            <span>Flat</span>
            <span>Up</span>
        </div>
      </div>

      {/* Decay Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-cyan-400 font-mono text-sm">
          <span>DECAY // 衰减</span>
          <span>{params.decay.toFixed(2)} s</span>
        </div>
        <input
          type="range"
          min="0.05"
          max="2.0"
          step="0.05"
          value={params.decay}
          onChange={(e) => handleChange('decay', Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Controls;
