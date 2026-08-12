import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortVideo } from "@/lib/youtube";
import { parse } from "date-fns";

interface Props {
  shorts: ShortVideo[];
  normalize?: boolean;
}

export function SummaryCards({ shorts, normalize }: Props) {
  // Aggregate metrics
  const dayViews: Record<string, { total: number; count: number }> = {};
  const hourViews: Record<number, { total: number; count: number }> = {};

  shorts.forEach((s) => {
    // Day aggregation
    if (!dayViews[s.dayOfWeek]) {
      dayViews[s.dayOfWeek] = { total: 0, count: 0 };
    }
    dayViews[s.dayOfWeek].total += s.viewCount;
    dayViews[s.dayOfWeek].count += 1;

    // Hour aggregation
    // Parse time 'hh:mm:ss aa' back to hour
    const date = parse(s.uploadTimeIST, 'hh:mm:ss aa', new Date());
    const hour = date.getHours();
    
    if (!hourViews[hour]) {
      hourViews[hour] = { total: 0, count: 0 };
    }
    hourViews[hour].total += s.viewCount;
    hourViews[hour].count += 1;
  });

  const maxDayCount = Math.max(...Object.values(dayViews).map(d => d.count), 0);
  const maxHourCount = Math.max(...Object.values(hourViews).map(h => h.count), 0);

  // Calculate bests
  let bestDay = "N/A";
  let maxAvgDayViews = 0;

  for (const [day, data] of Object.entries(dayViews)) {
    const rawAvg = data.total / data.count;
    const avg = normalize && maxDayCount > 0 ? rawAvg * (data.count / maxDayCount) : rawAvg;
    if (avg > maxAvgDayViews) {
      maxAvgDayViews = avg;
      bestDay = day;
    }
  }

  let bestHour = -1;
  let maxAvgHourViews = 0;

  const hourAverages: { hour: number; avg: number }[] = [];

  for (const [hStr, data] of Object.entries(hourViews)) {
    const hour = parseInt(hStr, 10);
    const rawAvg = data.total / data.count;
    const avg = normalize && maxHourCount > 0 ? rawAvg * (data.count / maxHourCount) : rawAvg;
    
    hourAverages.push({ hour, avg });
    if (avg > maxAvgHourViews) {
      maxAvgHourViews = avg;
      bestHour = hour;
    }
  }

  // Format best hour
  const formatHourWindow = (hour: number) => {
    if (hour === -1) return "N/A";
    const start = new Date();
    start.setHours(hour, 0, 0, 0);
    const end = new Date();
    end.setHours(hour + 1, 0, 0, 0);
    
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${fmt.format(start)} - ${fmt.format(end)}`;
  };

  // Top 3 peak windows
  hourAverages.sort((a, b) => b.avg - a.avg);
  const peakWindows = hourAverages.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Optimal Upload Time (IST)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatHourWindow(bestHour)}</div>
          <p className="text-xs text-neutral-500 mt-1">
            {normalize ? "Score: " : "Avg Views: "}
            {Math.round(maxAvgHourViews).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Best Upload Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{bestDay}</div>
          <p className="text-xs text-neutral-500 mt-1">
            {normalize ? "Score: " : "Avg Views: "}
            {Math.round(maxAvgDayViews).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral-400">Top 3 Peak Windows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {peakWindows.length > 0 ? (
              peakWindows.map((pw, i) => (
                <div key={pw.hour} className="flex justify-between items-center text-sm">
                  <span className="text-neutral-300">{i + 1}. {formatHourWindow(pw.hour)}</span>
                  <span className="text-neutral-500">{Math.round(pw.avg).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 text-sm">Not enough data</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
