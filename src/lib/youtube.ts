import { google } from 'googleapis';
import { parseISO } from 'date-fns';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export interface ShortVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  uploadDateIST: string;
  uploadTimeIST: string;
  dayOfWeek: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  videoUrl: string;
  duration: string;
  durationSeconds: number;
}

export async function getChannelShorts(query: string): Promise<ShortVideo[]> {
  try {
    let channelId = query;
    let uploadsPlaylistId = '';

    // If query starts with @, treat it as a handle
    if (query.startsWith('@')) {
      const handle = query.substring(1);
      const handleRes = await youtube.channels.list({
        part: ['contentDetails'],
        forHandle: handle,
      });

      if (handleRes.data.items && handleRes.data.items.length > 0) {
        uploadsPlaylistId = handleRes.data.items[0].contentDetails?.relatedPlaylists?.uploads || '';
      }
      
      // Fallback: search for handle if forHandle fails (some older APIs don't expose it properly)
      if (!uploadsPlaylistId) {
        const searchRes = await youtube.search.list({
            part: ['snippet'],
            q: query,
            type: ['channel'],
            maxResults: 1,
        });
        if (searchRes.data.items && searchRes.data.items.length > 0) {
            channelId = searchRes.data.items[0].snippet?.channelId || query;
        }
      }
    }

    if (!uploadsPlaylistId) {
        const channelRes = await youtube.channels.list({
            part: ['contentDetails'],
            id: [channelId],
        });
        if (channelRes.data.items && channelRes.data.items.length > 0) {
            uploadsPlaylistId = channelRes.data.items[0].contentDetails?.relatedPlaylists?.uploads || '';
        }
    }

    if (!uploadsPlaylistId) {
      throw new Error('Channel not found or has no uploads');
    }

    // Fetch latest 50 videos (to save quota)
    const playlistRes = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
    });

    if (!playlistRes.data.items) {
      return [];
    }

    const videoIds = playlistRes.data.items.map((item) => item.snippet?.resourceId?.videoId).filter(Boolean) as string[];

    if (videoIds.length === 0) return [];

    // Fetch video details (duration, views)
    const videosRes = await youtube.videos.list({
      part: ['contentDetails', 'statistics', 'snippet'],
      id: videoIds,
    });

    if (!videosRes.data.items) return [];

    const shorts: ShortVideo[] = [];
    const timeZone = 'Asia/Kolkata';

    for (const video of videosRes.data.items) {
      const duration = video.contentDetails?.duration || '';
      const seconds = parseDurationToSeconds(duration);
      
      if (seconds <= 61 && seconds > 0) { // Usually 60s, sometimes 61s
        const publishedAt = video.snippet?.publishedAt || '';
        const date = parseISO(publishedAt);
        const zonedDate = toZonedTime(date, timeZone);

        shorts.push({
          id: video.id || '',
          title: video.snippet?.title || '',
          thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url || '',
          publishedAt: publishedAt,
          uploadDateIST: formatTz(zonedDate, 'yyyy-MM-dd', { timeZone }),
          uploadTimeIST: formatTz(zonedDate, 'hh:mm:ss aa', { timeZone }),
          dayOfWeek: formatTz(zonedDate, 'EEEE', { timeZone }),
          viewCount: parseInt(video.statistics?.viewCount || '0', 10),
          likeCount: parseInt(video.statistics?.likeCount || '0', 10),
          commentCount: parseInt(video.statistics?.commentCount || '0', 10),
          videoUrl: `https://youtube.com/shorts/${video.id}`,
          duration: duration,
          durationSeconds: seconds,
        });
      }
    }

    return shorts;
  } catch (error) {
    console.error('Error fetching YouTube shorts:', error);
    throw error;
  }
}

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}
