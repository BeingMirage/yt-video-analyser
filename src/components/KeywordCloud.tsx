"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShortVideo } from "@/lib/youtube";

interface Props {
  shorts: ShortVideo[];
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", 
  "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", 
  "their", "then", "there", "these", "they", "this", "to", "was", "will", 
  "with", "what", "why", "how", "you", "i", "my", "your", "we", "he", "she"
]);

export function KeywordCloud({ shorts }: Props) {
  // Extract and tally keywords
  const keywordMap = new Map<string, { count: number; totalViews: number }>();

  shorts.forEach(s => {
    // Extract words (ignore punctuation, convert to lowercase)
    const words = s.title.toLowerCase().replace(/[^\w\s#]/gi, '').split(/\s+/);
    
    // Use a Set to only count a word once per video
    const uniqueWords = new Set(words);
    
    uniqueWords.forEach(word => {
      if (word.length > 2 && !STOP_WORDS.has(word)) {
        const current = keywordMap.get(word) || { count: 0, totalViews: 0 };
        keywordMap.set(word, {
          count: current.count + 1,
          totalViews: current.totalViews + s.viewCount
        });
      }
    });
  });

  // Convert to array and filter out words that only appear once
  const keywords = Array.from(keywordMap.entries())
    .map(([word, data]) => ({
      word,
      count: data.count,
      avgViews: data.count > 0 ? data.totalViews / data.count : 0
    }))
    .filter(k => k.count > 1)
    .sort((a, b) => b.avgViews - a.avgViews)
    .slice(0, 15); // Top 15 keywords by average views

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Top Performing Keywords</CardTitle>
        <CardDescription className="text-neutral-400">Words from titles that average the most views.</CardDescription>
      </CardHeader>
      <CardContent>
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {keywords.map((k) => (
              <div 
                key={k.word} 
                className="flex flex-col items-start p-3 bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 hover:border-red-900/50 rounded-xl text-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-900/10"
              >
                <span className="text-sm font-semibold">{k.word.toUpperCase()}</span>
                <span className="text-xs text-neutral-400 mt-1">
                  Avg: {Math.round(k.avgViews).toLocaleString()} views
                </span>
                <span className="text-xs text-red-400">
                  Used in {k.count} videos
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 py-4 text-center">
            Not enough common keywords found in recent videos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
