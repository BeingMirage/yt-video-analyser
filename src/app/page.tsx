"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/SummaryCards";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { ShortsTable } from "@/components/ShortsTable";
import { DurationChart } from "@/components/DurationChart";
import { GrowthChart } from "@/components/GrowthChart";
import { KeywordCloud } from "@/components/KeywordCloud";
import { ShortVideo } from "@/lib/youtube";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [query, setQuery] = useState("");
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [normalize, setNormalize] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    setShorts([]);

    try {
      const res = await fetch(`/api/shorts?channel=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch channel data");
      }

      setShorts(data.shorts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
            YouTube Shorts Analyzer
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Discover the exact time to upload your Shorts for maximum viral potential.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto bg-neutral-900/40 backdrop-blur-md border-neutral-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Analyze a Channel</CardTitle>
            <CardDescription className="text-neutral-400">
              Enter a YouTube channel URL, ID, or @handle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="e.g. @simstuffs108"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-neutral-950/50 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 transition-all"
              />
              <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all hover:scale-105 active:scale-95">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-900 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasSearched && shorts.length === 0 && (
          <div className="text-center text-neutral-500 py-12">
            No Shorts found for this channel (duration ≤ 60s). Note: Only the latest 50 uploads are checked.
          </div>
        )}

        {!loading && !error && shorts.length > 0 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SummaryCards shorts={shorts} normalize={normalize} />

            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-center md:justify-start">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 rounded-md">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-400 rounded-md">
                    Deep Dive Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-8 mt-0 focus-visible:outline-none">
                <AnalyticsChart
                  shorts={shorts}
                  selectedHour={selectedHour}
                  onBarClick={(hour) => setSelectedHour(hour === selectedHour ? null : hour)}
                  normalize={normalize}
                  onNormalizeToggle={() => setNormalize(!normalize)}
                />
                <ShortsTable
                  shorts={shorts}
                  hourFilter={selectedHour}
                  onClearFilter={() => setSelectedHour(null)}
                />
              </TabsContent>

              <TabsContent value="insights" className="space-y-8 mt-0 focus-visible:outline-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GrowthChart shorts={shorts} />
                  <DurationChart shorts={shorts} />
                </div>
                <KeywordCloud shorts={shorts} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
