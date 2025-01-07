import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getRandomPosition } from '@/lib/game';
import { audioManager } from '@/lib/audio';

interface DistractionsProps {
  enabled: boolean;
  intensity?: number;
}

export default function Distractions({ enabled, intensity = 0 }: DistractionsProps) {
  const [distractions, setDistractions] = useState<{ id: number; x: number; y: number; text: string; scale: number; flicker: boolean }[]>([]);

  const distractionTexts = [
    'SYSTEM OVERLOAD',
    '404 ERROR',
    'ACCESS DENIED',
    'FATAL ERROR',
    'SECURITY BREACH',
    'SYSTEM FAILURE',
    'BUFFER OVERFLOW',
    'MEMORY LEAK',
    'KERNEL PANIC',
    'STACK OVERFLOW',
    'CRITICAL ERROR',
    'SYSTEM CRASH',
    'DATA CORRUPT',
    'BREACH DETECTED'
  ];

  useEffect(() => {
    if (!enabled) {
      setDistractions([]);
      return;
    }

    const interval = setInterval(() => {
      // Exponentially increase spawn rate with intensity
      const baseSpawnChance = 0.4;
      const maxDistractions = 5 + Math.floor(intensity * 20); // Up to 25 distractions at max intensity

      if (Math.random() < (baseSpawnChance + Math.pow(intensity, 2)) && distractions.length < maxDistractions) {
        const position = getRandomPosition();
        const text = distractionTexts[Math.floor(Math.random() * distractionTexts.length)];

        audioManager.playError();

        setDistractions(prev => [
          ...prev,
          { 
            id: Date.now(),
            x: position.x,
            y: position.y,
            text,
            scale: 0.8 + Math.random() * 0.4 + intensity * 0.8, // Larger scale for more impact
            flicker: Math.random() > 0.3 // More flickering
          }
        ]);
      }

      // Randomly update positions of existing distractions during high intensity
      if (intensity > 0.7) {
        setDistractions(prev => prev.map(d => ({
          ...d,
          x: Math.random() > 0.7 ? getRandomPosition().x : d.x,
          y: Math.random() > 0.7 ? getRandomPosition().y : d.y,
          flicker: Math.random() > 0.2
        })));
      }

      // Remove old distractions, but keep more around at higher intensity
      setDistractions(prev => prev.filter(d => Math.random() > (0.1 + intensity * 0.1)));
    }, 300 - (intensity * 250)); // Even faster spawning at high intensity (50ms at max)

    return () => clearInterval(interval);
  }, [enabled, intensity, distractions.length]);

  if (!enabled) return null;

  return (
    <>
      {distractions.map((distraction) => (
        <Button
          key={distraction.id}
          className={`absolute transition-all duration-100 bg-black hover:bg-[#330000] text-[#ff0000] border-[#ff0000] border-2 font-mono pointer-events-none ${
            distraction.flicker ? 'animate-pulse' : ''
          }`}
          style={{
            left: `${distraction.x}%`,
            top: `${distraction.y}%`,
            transform: `translate(-50%, -50%) scale(${distraction.scale})`,
            zIndex: 10,
            opacity: distraction.flicker ? (Math.random() > 0.5 ? 1 : 0.3) : 0.8,
            animationDuration: `${0.1 + Math.random() * 0.2}s`,
            textShadow: '0 0 10px #ff0000',
          }}
        >
          {distraction.text}
        </Button>
      ))}
    </>
  );
}