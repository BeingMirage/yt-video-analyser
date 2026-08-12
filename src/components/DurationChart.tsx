"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShortVideo } from "@/lib/youtube";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  shorts: ShortVideo[];
}

export function DurationChart({ shorts }: Props) {
  const data = shorts.map(s => ({
    title: s.title,
    duration: s.durationSeconds,
    views: s.viewCount
  }));



  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Duration vs Views (Sweet Spot)</CardTitle>
        <CardDescription className="text-neutral-400">Discover which video length performs best.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                type="number" 
                dataKey="duration" 
                name="Duration" 
                unit="s" 
                stroke="#888" 
                domain={[0, 65]} 
                tickCount={14}
              />
              <YAxis 
                type="number" 
                dataKey="views" 
                name="Views" 
                stroke="#888" 
                tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} 
              />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-neutral-900 border border-neutral-700 p-3 rounded-lg shadow-lg max-w-xs">
                        <p className="text-white font-medium mb-2 line-clamp-2">{data.title}</p>
                        <div className="space-y-1">
                          <p className="text-red-400 text-sm flex justify-between gap-4">
                            <span>Views:</span>
                            <span className="font-bold">{data.views.toLocaleString()}</span>
                          </p>
                          <p className="text-neutral-300 text-sm flex justify-between gap-4">
                            <span>Duration:</span>
                            <span className="font-bold">{data.duration}s</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ strokeDasharray: '3 3' }} 
              />
              <Scatter name="Shorts" data={data} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
