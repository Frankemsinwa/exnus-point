"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, Twitter, MessageSquare, Heart, PartyPopper } from 'lucide-react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { User } from '@/lib/db';
import { activateMining, completeTask, claimReward, MINE_DURATION_MS, POINTS_PER_SESSION } from '@/app/dashboard/actions';

const tasks = [
    { id: 'task1', label: 'Follow on X', icon: Twitter },
    { id: 'task2', label: 'Join Community', icon: MessageSquare },
    { id: 'task3', label: 'Like & RT Post', icon: Heart },
];

type MiningCardProps = {
  user: User;
  setBalance: (newBalance: number) => void;
};

export function MiningCard({ user, setBalance }: MiningCardProps) {
  const { publicKey, signMessage } = useWallet();
  const { toast } = useToast();

  const [isMining, setIsMining] = useState(false);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(user.tasksCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimable, setIsClaimable] = useState(false);

  useEffect(() => {
    if (user.miningEndTime && Date.now() < user.miningEndTime) {
        setIsMining(true);
        setMiningEndTime(user.miningEndTime);
        setIsClaimable(false);
    } else if (user.miningEndTime && Date.now() >= user.miningEndTime) {
        setIsMining(false);
        setIsClaimable(true);
    } else {
        setIsMining(false);
        setIsClaimable(false);
    }
  }, [user.miningEndTime]);

  useEffect(() => {
    if (isMining && miningEndTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = miningEndTime - now;
        if (remaining <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          setIsMining(false);
          setIsClaimable(true);
          toast({ title: "Mining Complete!", description: `Ready to claim ${POINTS_PER_SESSION} points.` });
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMining, miningEndTime, toast]);

  const handleTaskChange = async (taskId: 'task1' | 'task2' | 'task3', checked: boolean) => {
    if (!publicKey) return;
    const newTasks = { ...tasksCompleted, [taskId]: checked };
    setTasksCompleted(newTasks);
    await completeTask(publicKey.toBase58(), taskId);
  };

  const allTasksCompleted = Object.values(tasksCompleted).every(Boolean);

  const handleActivateMining = async () => {
    if (!publicKey || !signMessage) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to start mining.' });
      return;
    }

    setIsLoading(true);
    try {
      const message = new TextEncoder().encode("Activate EXNUS POINTS mining for 24 hours.");
      await signMessage(message);
      
      const result = await activateMining(publicKey.toBase58());

      if (result.success) {
          const endTime = Date.now() + MINE_DURATION_MS;
          setMiningEndTime(endTime);
          setIsMining(true);
          setIsClaimable(false);
          setTimeLeft(MINE_DURATION_MS);
          toast({ title: "Mining Activated!", description: "You are now mining points for the next 24 hours." });
      } else {
          toast({ variant: 'destructive', title: 'Activation Failed', description: result.message });
      }
    } catch (error) {
      console.error("Sign message error:", error);
      toast({ variant: 'destructive', title: 'Signature Failed', description: 'The signature request was rejected. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async () => {
      if (!publicKey) return;
      setIsLoading(true);
      const result = await claimReward(publicKey.toBase58());
      if (result.success && result.newBalance !== undefined) {
          setBalance(result.newBalance);
          setIsClaimable(false);
          setMiningEndTime(null);
          toast({ title: "Success!", description: result.message });
      } else {
          toast({ variant: 'destructive', title: 'Claim Failed', description: result.message });
      }
      setIsLoading(false);
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const percentage = miningEndTime ? ((MINE_DURATION_MS - timeLeft) / MINE_DURATION_MS) * 100 : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Mining Hub</CardTitle>
        <CardDescription>Your available points balance: <span className="text-accent font-bold">{user.points.toLocaleString()} POINTS</span></CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-6">
        {isMining ? (
          <div className="w-48 h-48 relative">
            <CircularProgressbar
                value={percentage}
                strokeWidth={6}
                styles={buildStyles({
                    pathColor: `hsl(var(--accent))`,
                    textColor: `hsl(var(--foreground))`,
                    trailColor: `hsl(var(--muted))`,
                    backgroundColor: '#3e98c7',
                })}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</div>
                <div className="text-sm text-muted-foreground">TIME LEFT</div>
            </div>
          </div>
        ) : isClaimable ? (
            <div className="flex flex-col items-center gap-4">
                <PartyPopper className="h-24 w-24 text-accent" />
                <h3 className="text-xl font-bold">Mining Session Complete!</h3>
                <p className="text-muted-foreground">Claim your {POINTS_PER_SESSION.toLocaleString()} points.</p>
            </div>
        ) : (
          <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold">Complete tasks to start mining</h3>
            <div className="space-y-3 text-left max-w-sm mx-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-3 bg-muted p-3 rounded-md">
                  <Checkbox 
                    id={task.id} 
                    checked={tasksCompleted[task.id as keyof typeof tasksCompleted]} 
                    onCheckedChange={(checked) => handleTaskChange(task.id as 'task1' | 'task2' | 'task3', Boolean(checked))}
                  />
                  <task.icon className="h-5 w-5 text-muted-foreground" />
                  <label htmlFor={task.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {task.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isClaimable ? (
            <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleClaimReward}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PartyPopper className="mr-2 h-4 w-4" />}
                Claim Reward
            </Button>
        ) : (
            <Button 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleActivateMining}
              disabled={!allTasksCompleted || isMining || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isMining ? 'Mining Active' : 'Activate Mining'}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
