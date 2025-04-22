import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

export async function GET(request) {
  console.log('Callback GET hit');

  // 1. Test DB connection
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('DB connection failed:', err);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  // 2. Parse the code & state from the URL
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const deviceId = searchParams.get('state');

  if (!code || !deviceId) {
    console.error('Missing code or state:', { code, deviceId });
    return NextResponse.json({ error: 'Missing code or device ID' }, { status: 400 });
  }

  // 3. Verify device exists
  const check = await dataModel.checkRefreshToken({ id: deviceId });
  if (!check.success) {
    console.error('DB check failed:', check.error);
    return NextResponse.json({ error: 'Failed to verify device' }, { status: 500 });
  }
  if (check.rows.length === 0) {
    console.error('Unknown device:', deviceId);
    return NextResponse.json({ error: 'Device not registered' }, { status: 404 });
  }

  // 4. Exchange code for tokens
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI
  });
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')
    },
    body: params
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Spotify token error:', data);
    return NextResponse.json(
      { error: 'Spotify token exchange failed', details: data },
      { status: response.status }
    );
  }

  // 5. Persist the refresh token
  if (!data.refresh_token) {
    console.error('No refresh token returned:', data);
    return NextResponse.json({ error: 'No refresh token from Spotify' }, { status: 400 });
  }
  
  const store = await dataModel.storeRefreshToken({
    id: deviceId,
    refresh_token: data.refresh_token
  });
  
  if (!store.success) {
    console.error('Failed to store token:', store.error);
    return NextResponse.json({ error: 'Failed to persist refresh token' }, { status: 500 });
  }

  // 6. Redirect to success page
  return NextResponse.redirect(`/success?device=${deviceId}`);
}
