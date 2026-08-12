import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShortVideo } from "@/lib/youtube";
import { parse } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface Props {
  shorts: ShortVideo[];
  onBarClick?: (hour: number) => void;
  selectedHour?: number | null;
  normalize?: boolean;
  onNormalizeToggle?: () => void;
}

export function AnalyticsChart({ shorts, onBarClick, selectedHour, normalize, onNormalizeToggle }: Props) {
  const hourViews: Record<number, { total: number; count: number }> = {};

  // Initialize all 24 hours
  for (let i = 0; i < 24; i++) {
    hourViews[i] = { total: 0, count: 0 };
  }

  shorts.forEach((s) => {
    const date = parse(s.uploadTimeIST, 'hh:mm:ss aa', new Date());
    const hour = date.getHours();
    hourViews[hour].total += s.viewCount;
    hourViews[hour].count += 1;
  });

  const maxVideos = Math.max(...Object.values(hourViews).map(h => h.count));

  const data = Object.keys(hourViews).map((h) => {
    const hour = parseInt(h, 10);
    const count = hourViews[hour].count;
    const avg = count > 0 ? hourViews[hour].total / count : 0;
    
    // Normalize by weighing the average against the max videos uploaded in any hour
    const normalizedAvg = normalize && maxVideos > 0 
      ? avg * (count / maxVideos) 
      : avg;
    
    // Format hour label (e.g., "1 PM")
    const labelDate = new Date();
    labelDate.setHours(hour, 0, 0, 0);
    const label = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(labelDate);

    return {
      hour: label,
      hourNumber: hour,
      avgViews: Math.round(normalizedAvg),
      originalAvg: Math.round(avg),
      videos: count,
    };
  });



  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold text-white">Average Views by Upload Hour (IST)</CardTitle>
          <CardDescription className="text-neutral-400">Discover when your audience is most active based on past performance.</CardDescription>
        </div>
        {onNormalizeToggle && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNormalizeToggle}
            className={normalize ? "bg-red-950/50 border-red-900 text-red-400 hover:bg-red-900/50 hover:text-red-300" : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"}
          >
            {normalize ? "Normalized (Weighted)" : "Normalize by Video Count"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="hour" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 p-3 rounded-xl shadow-2xl">
                        <p className="text-white font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          <p className="text-red-400 text-sm flex justify-between gap-4">
                            <span>{normalize ? "Normalized Score:" : "Average Views:"}</span>
                            <span className="font-bold">{point.avgViews.toLocaleString()}</span>
                          </p>
                          {normalize && (
                            <p className="text-neutral-500 text-xs flex justify-between gap-4">
                              <span>Original Avg:</span>
                              <span>{point.originalAvg.toLocaleString()}</span>
                            </p>
                          )}
                          <p className="text-neutral-300 text-sm flex justify-between gap-4">
                            <span>Videos Uploaded:</span>
                            <span className="font-bold">{point.videos}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: '#333' }}
              />
              <Bar 
                dataKey="avgViews" 
                radius={[4, 4, 0, 0]} 
                name="Average Views"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={(data: any) => {
                  if (onBarClick && data?.payload?.hourNumber !== undefined) {
                    onBarClick(data.payload.hourNumber);
                  }
                }}
                className={onBarClick ? "cursor-pointer" : ""}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedHour === entry.hourNumber ? '#f87171' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
