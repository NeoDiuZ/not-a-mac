import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const scope = 'user-read-currently-playing user-read-playback-state user-read-private';
  
  // Use a fixed state or generate one if it doesn't exist
  const state = 'spotify-auth-state'; // Using a fixed state for consistency
  
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state
  });

  const url = `https://accounts.spotify.com/authorize?${params}`;
  
  return NextResponse.json({ url });
} 