"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShortVideo } from "@/lib/youtube";
import { ArrowUpDown, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parse } from "date-fns";

interface Props {
  shorts: ShortVideo[];
  hourFilter?: number | null;
  onClearFilter?: () => void;
}

type SortField = 'uploadDateIST' | 'viewCount';
type SortOrder = 'asc' | 'desc';

export function ShortsTable({ shorts, hourFilter, onClearFilter }: Props) {
  const [sortField, setSortField] = useState<SortField>('uploadDateIST');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default new sort to desc
    }
  };

  const filteredShorts = hourFilter !== null && hourFilter !== undefined
    ? shorts.filter((s) => {
        const date = parse(s.uploadTimeIST, 'hh:mm:ss aa', new Date());
        return date.getHours() === hourFilter;
      })
    : shorts;

  const sortedShorts = [...filteredShorts].sort((a, b) => {
    if (sortField === 'viewCount') {
      return sortOrder === 'asc' ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
    } else {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-white">Latest Shorts Performance</CardTitle>
        {hourFilter !== null && hourFilter !== undefined && (
          <Button variant="outline" size="sm" onClick={onClearFilter} className="border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300">
            Filtered by Hour: {hourFilter}:00
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-neutral-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-neutral-950">
              <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                <TableHead className="w-[100px] text-neutral-400">Video</TableHead>
                <TableHead className="text-neutral-400">Title</TableHead>
                <TableHead className="text-neutral-400">
                  <Button variant="ghost" onClick={() => handleSort('uploadDateIST')} className="p-0 h-auto hover:bg-transparent text-neutral-400 hover:text-white">
                    Upload Date (IST) <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-neutral-400">Time (IST)</TableHead>
                <TableHead className="text-neutral-400 text-right">
                  <Button variant="ghost" onClick={() => handleSort('viewCount')} className="p-0 h-auto hover:bg-transparent text-neutral-400 hover:text-white">
                    Exact Views <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedShorts.map((short) => (
                <TableRow key={short.id} className="border-neutral-800 hover:bg-neutral-800/50">
                  <TableCell>
                    <div className="relative group w-16 h-24 rounded overflow-hidden bg-neutral-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={short.thumbnail} alt={short.title} className="object-cover w-full h-full" />
                      <a href={short.videoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink className="h-5 w-5 text-white" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-200">
                    <p className="line-clamp-2">{short.title}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs bg-neutral-800/50 border-neutral-700 text-neutral-400">
                        {short.duration.replace('PT', '').toLowerCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-300">
                    {short.uploadDateIST}
                    <div className="text-xs text-neutral-500 mt-1">{short.dayOfWeek}</div>
                  </TableCell>
                  <TableCell className="text-neutral-300">{short.uploadTimeIST}</TableCell>
                  <TableCell className="text-right font-mono text-neutral-200">
                    {short.viewCount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {sortedShorts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-neutral-500">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
