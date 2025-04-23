import { NextResponse } from 'next/server';
import querystring from 'querystring';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Extract the device ID from the query parameter
  const deviceId = searchParams.get('id');
  if (!deviceId) {
    return NextResponse.json({ error: 'Missing device ID' }, { status: 400 });
  }

  const scope = 'user-read-playback-state user-read-currently-playing user-modify-playback-state';
  
  const authUrl = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: deviceId,
    show_dialog: true
  });
  
  return NextResponse.redirect(authUrl);
} 