import { Progress } from "@/components/ui/progress";

interface GameTimerProps {
  timeLeft: number;
}

export default function GameTimer({ timeLeft }: GameTimerProps) {
  return (
    <div className="flex items-center gap-2">
      <Progress 
        value={timeLeft * (100/15)} 
        className="w-32 bg-black border-[#00ff00] border"
      />
      <span className="font-mono">{timeLeft}s</span>
    </div>
  );
}