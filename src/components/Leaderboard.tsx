import { useEffect, useState } from 'react';
import { Trophy, Zap, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UsageEntry {
  email: string;
  requests: number;
  cost_dollars: number;
}

export function Leaderboard() {
  const [entries, setEntries] = useState<UsageEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      const { data } = await supabase
        .from('api_usage')
        .select('email, requests, cost_dollars')
        .order('requests', { ascending: false });
      if (data) setEntries(data as UsageEntry[]);
    };
    fetchUsage();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-button text-muted-foreground hover:text-foreground transition-all duration-300"
      >
        <Trophy className="w-3.5 h-3.5 text-yellow-500" />
        <span className="text-xs font-rounded font-bold">Leaderboard</span>
      </button>

      {open && (
        <div className="absolute top-10 left-0 mt-1 w-80 glass-card rounded-2xl p-4 animate-fade-in shadow-xl border border-white/10">
          <h3 className="text-sm font-rounded font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            API Usage Leaderboard
          </h3>
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={entry.email}
                className="flex items-center justify-between p-2.5 rounded-xl bg-background/30 border border-white/5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{medals[i] || `${i + 1}.`}</span>
                  <span className="text-xs font-rounded font-bold truncate">{entry.email}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-rounded">
                    <Zap className="w-3 h-3 text-accent" />
                    {entry.requests}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-rounded">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    {Number(entry.cost_dollars).toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-xs text-muted-foreground font-rounded text-center py-2">No data yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
