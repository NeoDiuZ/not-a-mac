import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const scope = 'user-read-currently-playing user-read-playback-state user-read-private';
  
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: Math.random().toString(36).substring(7) // Simple random state
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
} 