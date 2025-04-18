import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';
import querystring from 'querystring';

export async function POST(request) {
  try {
    console.log('API route invoked: /api/spotify/register');
    
    // Log environment variables availability (not the actual values for security)
    console.log('Environment check:', {
      'DATABASE_URL exists': !!process.env.DATABASE_URL,
      'SPOTIFY_CLIENT_ID exists': !!process.env.SPOTIFY_CLIENT_ID,
      'SPOTIFY_CLIENT_SECRET exists': !!process.env.SPOTIFY_CLIENT_SECRET,
      'SPOTIFY_REDIRECT_URI exists': !!process.env.SPOTIFY_REDIRECT_URI,
      'SPOTIFY_REDIRECT_URI value': process.env.SPOTIFY_REDIRECT_URI
    });
    
    const body = await request.json();
    const { mac } = body;

    if (!mac) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    // If any database operations fail, we'll still try to provide Spotify auth
    let hasToken = false;
    let registerResult = { success: false };

    try {
      console.log('Checking refresh token for device:', mac);
      // Check if user (device) already has a refresh token
      const result = await dataModel.checkRefreshToken({ id: mac });
      console.log('checkRefreshToken result:', JSON.stringify(result));
      
      hasToken = result.rows?.length > 0 && result.rows[0]?.refresh_token !== null && result.rows[0]?.refresh_token !== '';

      if (hasToken) {
        console.log('User already exists with token.');
        // Return success response instead of redirecting
        return NextResponse.json({ success: true, redirectTo: '/success' });
      }

      // If no token, register the device
      console.log('Registering device:', mac);
      registerResult = await dataModel.registerUser({ id: mac });
      console.log('registerUser result:', JSON.stringify(registerResult));
      
      if (!registerResult.success && registerResult.message === 'User already exists') {
        console.log('User already exists (but missing token?)');
      } else {
        console.log('New user registered:', mac);
      }
    } catch (dbError) {
      console.error('Database operation failed, proceeding with Spotify auth anyway:', {
        message: dbError.message,
        code: dbError.code
      });
      // Continue with Spotify auth despite DB errors
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
    console.log('Generated Spotify auth URL with redirect URI:', process.env.SPOTIFY_REDIRECT_URI);
    
    // Return the URL instead of redirecting
    return NextResponse.json({ success: true, authUrl: spotifyAuthUrl });
  } catch (err) {
    console.error('Error in register route:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
