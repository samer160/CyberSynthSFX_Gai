import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioService.getAnalyser();
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // Cyberpunk Grid Background Clear
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f3ff';
      
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-32 bg-black border border-cyan-800 rounded-lg overflow-hidden mb-6 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
        <div className="absolute top-2 left-2 text-xs text-cyan-600 font-mono pointer-events-none">VISUALIZER_OUTPUT_V.0.9</div>
        <canvas ref={canvasRef} width={800} height={200} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;