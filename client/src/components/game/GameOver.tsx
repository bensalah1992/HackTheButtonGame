import { Button } from "@/components/ui/button";

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

export default function GameOver({ score, onRestart }: GameOverProps) {
  return (
    <div className="text-center font-mono">
      <h2 className="text-2xl mb-4">MISSION COMPLETE</h2>

      <div className="space-y-2 mb-8">
        <p>Your Score: {score}</p>
      </div>

      <Button
        onClick={onRestart}
        className="bg-black hover:bg-[#003300] text-[#00ff00] border-[#00ff00] border-2"
      >
        HACK AGAIN
      </Button>
    </div>
  );
}