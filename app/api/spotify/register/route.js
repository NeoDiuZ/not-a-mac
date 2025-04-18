import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';
import querystring from 'querystring';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mac } = body;

    if (!mac) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    // Check if user (device) already has a refresh token
    const result = await dataModel.checkRefreshToken({ id: mac });
    const hasToken = result.rows.length > 0 && result.rows[0].refresh_token !== null && result.rows[0].refresh_token !== '';

    if (hasToken) {
      console.log('User already exists with token.');
      // Return success response instead of redirecting
      return NextResponse.json({ success: true, redirectTo: '/success' });
    }

    // If no token, register the device
    const registerResult = await dataModel.registerUser({ id: mac });
    if (!registerResult.success && registerResult.message === 'User already exists') {
      console.log('User already exists (but missing token?)');
    } else {
      console.log('New user registered:', mac);
    }

    // Generate Spotify auth URL directly
    const scope = 'user-read-currently-playing user-read-playback-state user-read-private';
    const state = mac;
    
    const params = querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      state: state
    });
    
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?${params}`;
    console.log('Generated Spotify auth URL:', spotifyAuthUrl);
    
    // Return the URL instead of redirecting
    return NextResponse.json({ success: true, authUrl: spotifyAuthUrl });
  } catch (err) {
    console.error('Error in register route:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
