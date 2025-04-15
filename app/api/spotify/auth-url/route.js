import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Extract the device ID (MAC) from the query parameter
  const deviceId = searchParams.get('id');
  if (!deviceId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const scope = 'user-read-currently-playing user-read-playback-state user-read-private';
  
  // Use device ID as state to identify the device during callback
  const state = deviceId;
  
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

