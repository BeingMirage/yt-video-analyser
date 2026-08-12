import { NextResponse } from 'next/server';
import { getChannelShorts } from '@/lib/youtube';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');

    if (!channel) {
      return NextResponse.json({ error: 'Channel ID or handle is required' }, { status: 400 });
    }

    const shorts = await getChannelShorts(channel);
    
    return NextResponse.json({ shorts });
  } catch (error: unknown) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch channel shorts';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
