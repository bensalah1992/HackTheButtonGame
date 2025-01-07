import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { getRandomPosition } from '../../lib/game';
import { audioManager } from '@/lib/audio';

interface GameButtonProps {
  onScore: () => void;
  isHardMode?: boolean;
  intensity?: number;
}

export default function GameButton({ onScore, isHardMode = false, intensity = 0 }: GameButtonProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [fakePosition, setFakePosition] = useState({ x: 30, y: 30 });
  const [showFake, setShowFake] = useState(false);
  const [isRed, setIsRed] = useState(false);

  const moveButton = () => {
    setPosition(getRandomPosition());
    if (isHardMode) {
      setFakePosition(getRandomPosition());
      setShowFake(Math.random() > 0.3); // 70% chance to show fake button
    }
    onScore();
  };

  const handleFakeClick = () => {
    audioManager.playError();
  };

  // Color switching effect in hard mode
  useEffect(() => {
    if (!isHardMode || !intensity) return;

    const interval = setInterval(() => {
      // Higher chance of color switching at higher intensity
      if (Math.random() < 0.1 + (intensity * 0.4)) {
        setIsRed(prev => !prev);
        setTimeout(() => setIsRed(false), 200); // Always switch back to green
      }
    }, 500 - (intensity * 400)); // Faster switches at higher intensity

    return () => {
      clearInterval(interval);
      setIsRed(false);
    };
  }, [isHardMode, intensity]);

  useEffect(() => {
    setPosition(getRandomPosition());
    if (isHardMode) {
      setFakePosition(getRandomPosition());
      setShowFake(true);
    }
  }, [isHardMode]);

  return (
    <>
      <Button
        onClick={moveButton}
        className={`absolute transition-all duration-200 bg-black font-mono text-xl px-8 py-4 ${
          intensity > 0.7 ? 'animate-pulse' : ''
        } ${
          isRed ? 'hover:bg-[#330000] text-[#ff0000] border-[#ff0000]' : 'hover:bg-[#003300] text-[#00ff00] border-[#00ff00]'
        } border-2`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          scale: 1 + intensity * 0.3,
          transition: `all ${Math.max(0.2 - intensity * 0.15, 0.05)}s ease-out`,
          opacity: isHardMode && intensity > 0.7 ? (Math.random() > 0.8 ? 0.5 : 1) : 1,
        }}
      >
        CLICK ME
      </Button>

      {isHardMode && showFake && (
        <Button
          onClick={handleFakeClick}
          className="absolute transition-all duration-200 bg-black hover:bg-[#330000] text-[#ff0000] border-[#ff0000] border-2 font-mono text-xl px-8 py-4 animate-pulse"
          style={{
            left: `${fakePosition.x}%`,
            top: `${fakePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            scale: 1 + intensity * 0.3,
            transition: `all ${Math.max(0.2 - intensity * 0.15, 0.05)}s ease-out`,
            opacity: intensity > 0.7 ? (Math.random() > 0.8 ? 0.5 : 1) : 1,
          }}
        >
          CLICK ME
        </Button>
      )}
    </>
  );
}