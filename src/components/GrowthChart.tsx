"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShortVideo } from "@/lib/youtube";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  shorts: ShortVideo[];
}

export function GrowthChart({ shorts }: Props) {
  // Sort by date ascending for timeline
  const sortedShorts = [...shorts].sort((a, b) => {
    return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
  });

  const data = sortedShorts.map(s => ({
    title: s.title,
    date: s.uploadDateIST,
    views: s.viewCount
  }));



  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Historical View Trend</CardTitle>
        <CardDescription className="text-neutral-400">Chronological performance of the latest Shorts.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} 
              />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 p-3 rounded-xl shadow-2xl max-w-xs">
                        <p className="text-white font-medium mb-1 line-clamp-2">{point.title}</p>
                        <p className="text-neutral-400 text-xs mb-2">{label}</p>
                        <p className="text-red-400 text-sm flex justify-between gap-4">
                          <span>Views:</span>
                          <span className="font-bold">{point.views.toLocaleString()}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 3, fill: "#ef4444" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
