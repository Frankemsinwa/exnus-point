import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const leaderboardData = [
  { rank: 1, user: '8a...f3e', points: '1,250,000' },
  { rank: 2, user: 'b4...c1a', points: '1,180,500' },
  { rank: 3, user: 'd9...9b2', points: '1,150,000' },
  { rank: 4, user: '2c...7d8', points: '1,090,250' },
  { rank: 5, user: 'e1...a6f', points: '980,750' },
  { rank: 6, user: 'f7...3e4', points: '950,000' },
  { rank: 7, user: '1a...b2c', points: '920,100' },
  { rank: 1234, user: '4g...h5i (You)', points: '55,000' },
  { rank: 8, user: '3d...8f9', points: '890,500' },
  { rank: 9, user: '6e...2g1', points: '880,000' },
  { rank: 10, user: '7h...4i3', points: '870,250' },
];

const rankColors: { [key: number]: string } = {
    1: "bg-amber-400 text-amber-900",
    2: "bg-slate-300 text-slate-800",
    3: "bg-orange-400 text-orange-900",
}

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold md:text-2xl font-headline">Leaderboard</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Trophy className="h-6 w-6 text-accent" />
            Top Miners
          </CardTitle>
          <CardDescription>
            See who is leading the charge in the EXNUS POINTS airdrop event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.sort((a,b) => a.rank - b.rank).map((entry) => (
                <TableRow key={entry.rank} className={entry.user.includes('(You)') ? 'bg-accent/20' : ''}>
                  <TableCell className="font-medium">
                    <Badge variant="secondary" className={`text-base ${rankColors[entry.rank] || ''}`}>{entry.rank}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{entry.user}</TableCell>
                  <TableCell className="text-right font-semibold">{entry.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
