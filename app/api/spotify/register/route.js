import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mac } = body;

    if (!mac) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    // Check if user (device) already has a refresh token
    const result = await dataModel.checkRefreshToken({ id: mac });
    const hasToken = result.rows.length > 0 && result.rows[0].refresh_token !== null;

    if (hasToken) {
      console.log('User already exists with token.');
      // In Next.js route handlers, you can redirect like this:
      return NextResponse.redirect(new URL('/success.html', request.url));
    }

    // If no token, register the device
    const registerResult = await dataModel.registerUser({ id: mac });
    if (!registerResult.success && registerResult.message === 'User already exists') {
      console.log('User already exists (but missing token?)');
    } else {
      console.log('New user registered:', mac);
    }

    // Redirect to Spotify login
    const url = new URL('/api/spotify/auth-url', request.url); 
    url.searchParams.set('id', mac);
    // or if you have a specific route like /spotify/login
    // url.pathname = '/spotify/login';
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('Error in register route:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
