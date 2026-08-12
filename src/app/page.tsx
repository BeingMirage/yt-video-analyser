"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SummaryCards } from "@/components/SummaryCards";
import { AnalyticsChart } from "@/components/AnalyticsChart";
import { ShortsTable } from "@/components/ShortsTable";
import { ShortVideo } from "@/lib/youtube";

export default function Home() {
  const [query, setQuery] = useState("");
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col items-center text-center space-y-6 pt-12 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            YT Shorts Analyzer
          </h1>
          <p className="text-neutral-400 max-w-lg">
            Discover the optimal upload times and view count performance for any YouTube channel&apos;s Shorts in Indian Standard Time (IST).
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                type="text"
                placeholder="Channel ID or @handle"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-red-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </form>
        </div>

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
            <SummaryCards shorts={shorts} />
            <AnalyticsChart 
              shorts={shorts} 
              selectedHour={selectedHour} 
              onBarClick={(hour) => setSelectedHour(hour === selectedHour ? null : hour)} 
            />
            <ShortsTable 
              shorts={shorts} 
              hourFilter={selectedHour} 
              onClearFilter={() => setSelectedHour(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
