import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart, Gem } from 'lucide-react';
import { Skeleton } from "../ui/skeleton";

type Stats = {
  totalPointsMined: number;
  activeMiners: number;
  userRank: number;
}

export function StatsGrid({ stats }: { stats: Stats | null }) {
    if (!stats) {
        return (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 h-full">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col flex-grow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <Skeleton className="h-4 w-1/3" />
                             <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-3 w-2/3 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

  const statItems = [
    {
      title: "Total Points Mined",
      value: stats.totalPointsMined.toLocaleString(),
      icon: Gem,
      description: "Across all participants"
    },
    {
      title: "Active Miners",
      value: stats.activeMiners.toLocaleString(),
      icon: Users,
      description: "In the last 24 hours"
    },
    {
      title: "Your Rank",
      value: `#${stats.userRank.toLocaleString()}`,
      icon: BarChart,
      description: "Based on total points"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 h-full">
        {statItems.map((stat) => (
            <Card key={stat.title} className="flex flex-col flex-grow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
            </Card>
        ))}
    </div>
  );
}
