import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import querystring from 'querystring';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Extract the device ID (MAC) from the query parameter
  const deviceId = searchParams.get('id');
  if (!deviceId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  // Debug credentials (don't log the full secret)
  console.log('Spotify auth debug:', {
    'Client ID available': !!process.env.SPOTIFY_CLIENT_ID,
    'Client ID first 4 chars': process.env.SPOTIFY_CLIENT_ID ? process.env.SPOTIFY_CLIENT_ID.substring(0, 4) + '...' : 'not set',
    'Redirect URI': process.env.SPOTIFY_REDIRECT_URI || 'not set'
  });

  const scope = 'user-read-currently-playing user-read-playback-state user-read-private user-modify-playback-state';
  
  // Use device ID directly as state for verification
  const state = deviceId;
  
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state
  });

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params}`;
  
  // Redirect directly to Spotify auth
  return NextResponse.redirect(spotifyAuthUrl);
} 