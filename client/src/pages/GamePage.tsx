import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GameButton from '../components/game/GameButton';
import GameTimer from '../components/game/GameTimer';
import Instructions from '../components/game/Instructions';
import GameOver from '../components/game/GameOver';
import LeaderboardModal from '../components/game/LeaderboardModal';
import Distractions from '../components/game/Distractions';
import { getHighScore, setHighScore } from '../lib/game';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/lib/audio';

interface LeaderboardEntry {
  id: number;
  nickname: string;
  score: number;
  createdAt: string;
  isHardMode: boolean;
}

export default function GamePage() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'gameover'>('instructions');
  const [score, setScore] = useState(0);
  const [isHardMode, setIsHardMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [highScore, setHighScoreState] = useState(getHighScore());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [visibleEntries, setVisibleEntries] = useState<number>(0);
  const [screenShake, setScreenShake] = useState(false);
  const [gameIntensity, setGameIntensity] = useState(0);
  const [screenFlicker, setScreenFlicker] = useState(false);

  const { data: normalLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/normal'],
  });

  const { data: hardLeaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/hard'],
  });

  // Initialize audio system when component mounts
  useEffect(() => {
    audioManager.init();

    // Always play standard track when component mounts
    audioManager.playMusic('standard');

    return () => {
      audioManager.stopMusic();
    };
  }, []);

  // Typing animation effect
  useEffect(() => {
    const totalEntries = normalLeaderboard.length + hardLeaderboard.length;
    if (totalEntries > 0) {
      const interval = setInterval(() => {
        setVisibleEntries(prev =>
          prev < totalEntries ? prev + 1 : prev
        );
      }, 100);
      return () => clearInterval(interval);
    }
  }, [normalLeaderboard, hardLeaderboard]);

  const startGame = (hardMode: boolean) => {
    setIsHardMode(hardMode);
    setGameState('playing');
    setScore(0);
    setGameIntensity(0);
    const duration = hardMode ? 60 : 15;
    setTimeLeft(duration);
    setEndTime(Date.now() + duration * 1000);
    setScreenShake(false);
    setScreenFlicker(false);

    // Only switch to hard mode music if we're starting hard mode
    if (hardMode) {
      audioManager.playMusic('hardmode');
    }
  };

  // Hard mode effects (visual only now)
  useEffect(() => {
    if (gameState === 'playing' && isHardMode) {
      const totalDuration = 60000; // 60 seconds in ms
      const finalPhaseStart = 30000; // Last 30 seconds

      const effectsInterval = setInterval(() => {
        if (!endTime) return;

        const timeLeft = endTime - Date.now();
        const timePassed = totalDuration - timeLeft;
        let intensity = Math.min(timePassed / totalDuration, 1);

        // Exponential intensity increase in final phase
        if (timeLeft <= finalPhaseStart) {
          const finalPhaseProgress = (finalPhaseStart - timeLeft) / finalPhaseStart;
          intensity = Math.min(1, intensity + (finalPhaseProgress * finalPhaseProgress));
        }

        setGameIntensity(intensity);

        // Screen effects
        if (Math.random() < 0.1 + (intensity * 0.8)) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 50);
        }

        if (Math.random() < 0.05 + (intensity * 0.6)) {
          setScreenFlicker(true);
          setTimeout(() => setScreenFlicker(false), 30);
        }

      }, 50);

      return () => {
        clearInterval(effectsInterval);
        // Reset all visual effects when component unmounts or game ends
        setScreenShake(false);
        setScreenFlicker(false);
        setGameIntensity(0);
      };
    }
  }, [gameState, isHardMode, endTime]);

  // Track switching logic when game state changes
  useEffect(() => {
    if (gameState === 'gameover' && isHardMode) {
      // Switch back to standard track after hard mode ends
      audioManager.playMusic('standard');
    }
  }, [gameState, isHardMode]);

  useEffect(() => {
    if (gameState === 'playing' && endTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        if (now >= endTime) {
          clearInterval(timer);
          setGameState('gameover');
          const newHighScore = Math.max(score, highScore);
          setHighScore(newHighScore);
          setHighScoreState(newHighScore);
          setTimeLeft(0);
          setShowLeaderboard(true);
          if (isHardMode) {
            audioManager.playMusic('standard');
          }
        } else {
          const remaining = Math.ceil((endTime - now) / 1000);
          setTimeLeft(remaining);
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [gameState, endTime, score, highScore, isHardMode]);

  const handleScore = () => {
    audioManager.playClick();
    setScore(prev => prev + 1);
  };

  return (
    <motion.div
      className={`min-h-screen bg-black text-[#00ff00] p-4 flex flex-col ${
        screenFlicker ? 'opacity-30' : 'opacity-100'
      } ${timeLeft <= 30 && isHardMode && gameState === 'playing' ? 'bg-[#330000]' : ''}`}
      animate={screenShake ? {
        x: [0, -15, 15, -15, 0],
        transition: { duration: 0.1 }
      } : {}}
      style={{
        transform: isHardMode && gameState === 'playing' ?
          `skew(${Math.sin(Date.now() / 800) * gameIntensity * 5}deg) scale(${1 + Math.sin(Date.now() / 600) * gameIntensity * 0.15})` :
          'none',
        transition: 'transform 0.1s ease-out',
        backgroundColor: isHardMode && timeLeft <= 30 && gameState === 'playing' ?
          `rgba(51, 0, 0, ${Math.min(1, gameIntensity * 2)})` :
          undefined,
      }}
    >
      <div className="max-w-4xl mx-auto w-full flex-1">
        <h1 className="text-4xl font-mono text-center mb-8 font-bold tracking-wider">
          <span 
            className="relative inline-block"
            style={{
              textShadow: `
                0 0 2px #00ff00,
                0 0 4px #00ff00
              `,
              animation: 'pulse 2s ease-in-out infinite'
            }}
          >
            HACK THE BUTTON
          </span>
        </h1>

        <Card className={`bg-black/50 mb-8 ${timeLeft <= 30 && isHardMode && gameState === 'playing' ? 'border-[#ff0000] border-2' : ''}`}>
          <CardContent className="p-6">
            {gameState === 'instructions' && (
              <div className="text-center">
                <Instructions onStart={() => startGame(false)} />
                <Button
                  onClick={() => startGame(true)}
                  className="mt-4 bg-black hover:bg-[#330000] text-[#ff0000] border-[#ff0000] border-2 font-mono"
                >
                  START HARD MODE (60s)
                </Button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className={`relative min-h-[400px] ${timeLeft <= 30 && isHardMode ? 'bg-[#330000]/20' : ''}`}>
                <div className="flex justify-between mb-4">
                  <div className={`text-xl font-mono ${timeLeft <= 30 && isHardMode ? 'text-[#ff0000]' : ''}`}>
                    Score: {score}
                  </div>
                  <GameTimer timeLeft={timeLeft} />
                </div>
                <GameButton
                  onScore={handleScore}
                  isHardMode={isHardMode}
                  intensity={gameIntensity}
                />
                <Distractions enabled={isHardMode} intensity={gameIntensity} />
              </div>
            )}

            {gameState === 'gameover' && (
              <GameOver
                score={score}
                onRestart={() => setGameState('instructions')}
              />
            )}
          </CardContent>
        </Card>

        {/* Terminal-style Leaderboards */}
        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          {/* Normal Mode Leaderboard */}
          <div>
            <div className="flex items-center mb-2 border-b border-[#00ff00]/20">
              <span className="text-[#00ff00]">$</span>
              <span className="ml-1">cat normal.txt</span>
              <span className="ml-1 animate-pulse">▊</span>
            </div>
            <div className="flex flex-col">
              {normalLeaderboard.slice(0, visibleEntries).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center opacity-80 hover:opacity-100 transition-opacity font-mono"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    WebkitFontSmoothing: 'none'
                  }}
                >
                  <span className="mr-2 w-4">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="flex-1 mr-4">{entry.nickname.padEnd(15, ' ')}</span>
                  <span className="tabular-nums">{entry.score.toString().padStart(4, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hard Mode Leaderboard */}
          <div>
            <div className="flex items-center mb-2 border-b border-[#ff0000]/20">
              <span className="text-[#ff0000]">$</span>
              <span className="ml-1 text-[#ff0000]">cat hard.txt</span>
              <span className="ml-1 text-[#ff0000] animate-pulse">▊</span>
            </div>
            <div className="flex flex-col text-[#ff0000]">
              {hardLeaderboard.slice(0, visibleEntries).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center opacity-80 hover:opacity-100 transition-opacity font-mono"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    WebkitFontSmoothing: 'none'
                  }}
                >
                  <span className="mr-2 w-4">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="flex-1 mr-4">{entry.nickname.padEnd(15, ' ')}</span>
                  <span className="tabular-nums">{entry.score.toString().padStart(4, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        score={score}
        isHardMode={isHardMode}
      />
      {/* Footer */}
      <footer className="mt-8 text-center font-mono text-sm opacity-50 hover:opacity-100 transition-opacity">
        <a
          href="https://www.ben-salah.de"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#00ff00] transition-colors"
        >
          © 2024 by benSalah with Replit | www.ben-salah.de
        </a>
      </footer>
    </motion.div>
  );
}