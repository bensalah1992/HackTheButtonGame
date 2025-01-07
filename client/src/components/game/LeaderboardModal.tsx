import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  isHardMode: boolean;
}

export default function LeaderboardModal({ isOpen, onClose, score, isHardMode }: LeaderboardModalProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submitScore = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, score, isHardMode }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leaderboard/${isHardMode ? 'hard' : 'normal'}`] });
      setError(null);
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      submitScore.mutate();
    }
  };

  const handleCancel = () => {
    setNickname('');
    setError(null);
    onClose();
  };

  const modeColor = isHardMode ? '[#ff0000]' : '[#00ff00]';
  const modeBgColor = isHardMode ? '[#330000]' : '[#003300]';

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className={`bg-black border-${modeColor} border-2 text-${modeColor} font-mono`}>
        <DialogHeader>
          <DialogTitle>{isHardMode ? 'Submit Hard Mode Score' : 'Submit Score'}</DialogTitle>
          <DialogDescription className={`text-${modeColor}/70`}>
            Enter your hacker alias to record your {isHardMode ? 'hard mode ' : ''}score
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-[#ff0000] bg-[#330000] p-3 border border-[#ff0000] text-sm">
              {error}
            </div>
          )}

          {score > 0 && (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your hacker alias"
                className={`bg-black border-${modeColor} text-${modeColor}`}
                maxLength={20}
                required
              />
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className={`flex-1 bg-${modeBgColor} hover:bg-${modeBgColor} border-${modeColor} border`}
                  disabled={submitScore.isPending}
                >
                  Submit Score
                </Button>
                <Button 
                  type="button"
                  onClick={handleCancel}
                  className={`flex-1 bg-black hover:bg-${modeBgColor} border-${modeColor} border`}
                >
                  Skip
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}