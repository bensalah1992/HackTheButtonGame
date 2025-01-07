export function getRandomPosition() {
  // Leave 10% padding from edges
  const min = 10;
  const max = 90;
  
  return {
    x: Math.floor(Math.random() * (max - min + 1)) + min,
    y: Math.floor(Math.random() * (max - min + 1)) + min
  };
}

const HIGH_SCORE_KEY = 'hackTheButton_highScore';

export function getHighScore(): number {
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  return stored ? parseInt(stored) : 0;
}

export function setHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, score.toString());
}
