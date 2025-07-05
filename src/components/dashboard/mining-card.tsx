
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, Twitter, Send, Check } from 'lucide-react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import type { User } from '@/lib/db';
import { activateMining, completeTask, claimReward } from '@/app/dashboard/actions';
import { MINE_DURATION_MS, POINTS_PER_SESSION } from '@/lib/constants';

const DiscordIcon = (props: React.ComponentProps<'svg'>) => (
    <svg {...props} fill="currentColor" viewBox="0 0 28 21"><path d="M23.021 1.631A20.22 20.22 0 0 0 17.65 0a.487.487 0 0 0-.448.204c-.233.414-.492.91-.676 1.353-2.622.247-5.14.247-7.762 0-.184-.443-.443-.939-.676-1.353a.487.487 0 0 0-.448-.204 20.218 20.218 0 0 0-5.371 1.63A.464.464 0 0 0 2.23 1.838C.203 5.586-.23 9.68.062 13.729a.48.48 0 0 0 .238.395c.38.193.777.37 1.171.536a.49.49 0 0 0 .506-.095c.36-.264.683-.564.966-.888a.494.494 0 0 0 .048-.56C4.04 12.8 3.868 12.43 3.731 12.05a.487.487 0 0 1 .28-.546c.35-.12.688-.23.99-.327a.492.492 0 0 1 .496.405c.106.6.265 1.2.476 1.787a13.313 13.313 0 0 0 3.513 3.303.487.487 0 0 0 .565.02c.481-.264.93-.574 1.348-.92a.487.487 0 0 0 .14-.546c-.204-.326-.4-.66-.584-1a.492.492 0 0 1 .13-.64c1.112.724 2.373 1.23 3.73 1.486a.486.486 0 0 0 .515-.327c.222-.6.394-1.21.525-1.828a.492.492 0 0 1 .496-.405c.303.098.64.207.99.327a.487.487 0 0 1 .28.546c-.137.38-.308.75-.492 1.112a.492.492 0 0 0 .048.56c.283.324.606.624.966.888a.49.49 0 0 0 .506.095c.394-.166.79-.343 1.172-.536a.48.48 0 0 0 .238-.395c.35-4.05.078-8.15-1.95-11.89a.465.465 0 0 0-.038-.208ZM9.82 11.231c-.966 0-1.748-.834-1.748-1.857s.782-1.857 1.748-1.857c.966 0 1.748.834 1.748 1.857s-.782 1.857-1.748 1.857Zm7.618 0c-.966 0-1.748-.834-1.748-1.857s.782-1.857 1.748-1.857c.966 0 1.748.834 1.748 1.857.001 1.023-.782 1.857-1.748 1.857Z"/></svg>
);

const tasks = [
    { id: 'task1', label: 'Subscribe on Telegram', icon: Send, link: 'https://t.me/Exnusprotocol' },
    { id: 'task2', label: 'Join Discord', icon: DiscordIcon, link: 'https://discord.gg/vRmyxZ6p' },
    { id: 'task3', label: 'Follow us on X', icon: Twitter, link: 'https://x.com/exnusprotocol?t=mIdklHd5bdeUrao4qrwjYw&s=09' },
];

type MiningCardProps = {
  user: User;
  onRewardClaimed: () => void;
};

export function MiningCard({ user, onRewardClaimed }: MiningCardProps) {
  const { publicKey, signMessage } = useWallet();
  const { toast } = useToast();

  const [isMining, setIsMining] = useState(false);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(user.tasksCompleted);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyingTasks, setVerifyingTasks] = useState<Set<string>>(new Set());

  const handleClaimReward = useCallback(async () => {
      if (!publicKey) return;
      setIsProcessing(true);
      const result = await claimReward(publicKey.toBase58());
      if (result.success) {
          onRewardClaimed(); // Refetch data from parent
          toast({ title: "Session Complete!", description: result.message });
      } else {
          toast({ variant: 'destructive', title: 'Claim Failed', description: result.message });
      }
      setIsProcessing(false);
  }, [publicKey, onRewardClaimed, toast]);

  useEffect(() => {
    if (user.miningEndTime && Date.now() < user.miningEndTime) {
        setIsMining(true);
        setMiningEndTime(user.miningEndTime);
    } else if (user.miningEndTime && Date.now() >= user.miningEndTime) {
        // If the page is loaded after mining finished, claim immediately.
        handleClaimReward();
        setIsMining(false);
    } else {
        setIsMining(false);
    }
    setTasksCompleted(user.tasksCompleted);
  }, [user.miningEndTime, user.tasksCompleted, handleClaimReward]);

  useEffect(() => {
    if (isMining && miningEndTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = miningEndTime - now;
        if (remaining <= 0) {
          clearInterval(interval);
          setTimeLeft(0);
          setIsMining(false);
          handleClaimReward();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMining, miningEndTime, handleClaimReward]);

  const handleCompleteTask = useCallback((taskId: 'task1' | 'task2' | 'task3', link: string) => {
    if (!publicKey) return;

    window.open(link, '_blank');
    setVerifyingTasks(prev => new Set(prev).add(taskId));

    setTimeout(async () => {
        await completeTask(publicKey.toBase58(), taskId);
        
        setVerifyingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
        });
        onRewardClaimed(); // Refetch data
        toast({ title: "Task Verified!", description: "Thank you for completing the task." });
    }, 50000); // 50 seconds
  }, [publicKey, onRewardClaimed, toast]);

  const allTasksCompleted = Object.values(tasksCompleted).every(Boolean);
  const hasMinedBefore = user.lastClaimed !== null;

  const handleActivateMining = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast({ variant: 'destructive', title: 'Wallet not connected', description: 'Please connect your wallet to start mining.' });
      return;
    }

    setIsProcessing(true);
    try {
      const message = new TextEncoder().encode("Activate EXNUS POINTS mining for 24 hours.");
      await signMessage(message);
      
      const result = await activateMining(publicKey.toBase58());

      if (result.success) {
          onRewardClaimed();
          toast({ title: "Mining Activated!", description: "You are now mining points for the next 24 hours." });
      } else {
          toast({ variant: 'destructive', title: 'Activation Failed', description: result.message });
      }
    } catch (error) {
      console.error("Sign message error:", error);
      toast({ variant: 'destructive', title: 'Signature Failed', description: 'The signature request was rejected. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  }, [publicKey, signMessage, onRewardClaimed, toast]);

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const percentage = miningEndTime ? ((MINE_DURATION_MS - timeLeft) / MINE_DURATION_MS) * 100 : 0;
  const minedSoFar = isMining ? percentage / 100 * POINTS_PER_SESSION : 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Mining Hub</CardTitle>
        <CardDescription>Your available points balance: <span className="text-accent font-bold">{user.points.toLocaleString()} POINTS</span></CardDescription>
        <CardDescription className="pt-2 text-xs">
            { allTasksCompleted && hasMinedBefore 
                ? "You're all set! Start your next mining session anytime."
                : "Complete tasks, then activate mining for a 24-hour session. Points are automatically claimed when the session ends."
            }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-6">
        {isMining ? (
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="w-48 h-48 relative">
                <CircularProgressbar
                    value={percentage}
                    strokeWidth={6}
                    styles={buildStyles({
                        pathColor: `hsl(var(--accent))`,
                        textColor: `hsl(var(--foreground))`,
                        trailColor: `hsl(var(--muted))`,
                    })}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</div>
                    <div className="text-sm text-muted-foreground">TIME LEFT</div>
                </div>
            </div>
            <div className="mt-2 text-center">
              <div className="text-2xl font-bold text-accent">{Math.floor(minedSoFar).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">POINTS MINED</div>
            </div>
          </div>
        ) : (
          (allTasksCompleted && hasMinedBefore) ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 p-6">
                <div className="p-4 bg-accent/10 rounded-full">
                    <Zap className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-headline mt-4">Ready For a New Session?</h3>
                <p className="text-muted-foreground max-w-xs">
                    You've completed all the initial tasks. Click the button below to start your next 24-hour mining session.
                </p>
            </div>
          ) : (
            <div className="w-full space-y-4">
                <h3 className="text-lg font-semibold">Complete tasks to start mining</h3>
                <div className="space-y-3 text-left max-w-sm mx-auto">
                {tasks.map(task => {
                    const isCompleted = tasksCompleted[task.id as keyof typeof tasksCompleted];
                    const isVerifying = verifyingTasks.has(task.id);

                    return (
                        <div key={task.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                            <div className="flex items-center gap-3">
                                <task.icon className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm font-medium leading-none">
                                    {task.label}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant={isCompleted ? "ghost" : "secondary"}
                                onClick={() => handleCompleteTask(task.id as 'task1' | 'task2' | 'task3', task.link)}
                                disabled={isCompleted || isVerifying}
                            >
                                {isCompleted ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Completed
                                    </>
                                ) : isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Complete'
                                )}
                            </Button>
                        </div>
                    )
                })}
                </div>
            </div>
          )
        )}
      </CardContent>
      <CardFooter>
        <Button 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={handleActivateMining}
            disabled={!allTasksCompleted || isMining || isProcessing}
        >
            {isProcessing && !isMining ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
            <Zap className="mr-2 h-4 w-4" />
            )}
            {isMining ? 'Mining Active' : 'Activate Mining'}
        </Button>
      </CardFooter>
    </Card>
  );
}

