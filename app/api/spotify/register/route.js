import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mac } = body;

    if (!mac) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
    }

    try {
      // Check if user (device) already has a refresh token
      const result = await dataModel.checkRefreshToken({ id: mac });
      
      const hasToken = result.rows?.length > 0 && result.rows[0]?.refresh_token !== null;

      if (hasToken) {
        console.log('User already exists with token.');
        // Return success response with redirect to success page
        return NextResponse.json({ success: true, redirectTo: '/success' });
      }

      // If no token, register the device
      const registerResult = await dataModel.registerUser({ id: mac });
      
      if (!registerResult.success && registerResult.message === 'User already exists') {
        console.log('User already exists (but missing token)');
      } else {
        console.log('New user registered:', mac);
      }

      // Return authUrl that will redirect to Spotify login
      return NextResponse.json({ 
        success: true, 
        authUrl: `/api/spotify/login?id=${mac}` 
      });
      
    } catch (error) {
      console.error('Error in register route:', error);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error in register route:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
