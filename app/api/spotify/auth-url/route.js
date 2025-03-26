import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET() {
  const scope = 'user-read-currently-playing user-read-playback-state user-read-private';
  
  // Generate a unique session ID
  const sessionId = Math.random().toString(36).substring(2, 15);
  const state = `spotify-auth-state-${sessionId}`; // Include session ID in state
  
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state
  });

  const url = `https://accounts.spotify.com/authorize?${params}`;
  
  return NextResponse.json({ url, sessionId });
} 

