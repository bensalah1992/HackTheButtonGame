import { Button } from "@/components/ui/button";

interface InstructionsProps {
  onStart: () => void;
}

export default function Instructions({ onStart }: InstructionsProps) {
  return (
    <div className="text-center">
      <div className="font-mono space-y-4 mb-8">
        <p>Welcome, hacker. Your mission:</p>
        <ul className="space-y-2">
          <li>• Click the button as many times as possible</li>
          <li>• You have 15 seconds to beat your score</li>
        </ul>
      </div>

      <Button
        onClick={onStart}
        className="bg-black hover:bg-[#003300] text-[#00ff00] border-[#00ff00] border-2 font-mono"
      >
        START MISSION
      </Button>
    </div>
  );
}