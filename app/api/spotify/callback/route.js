import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const deviceId = searchParams.get('state');

  if (!code || !deviceId) {
    return NextResponse.json(
      { error: 'Missing authorization code or device ID.' },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64'),
      },
      body: params,
    });

    const data = await response.json();

    const refreshToken = data.refresh_token;
    const accessToken = data.access_token;

    console.log('Tokens generated:', { accessToken, refreshToken });

    await dataModel.storeRefreshToken({ id: deviceId, refreshToken });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
} 