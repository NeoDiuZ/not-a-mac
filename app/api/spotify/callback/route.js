import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';
import { Pool } from 'pg';

// Test database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function POST(request) {
  console.log('Callback endpoint hit');
  
  // Test database connection
  try {
    const testResult = await pool.query('SELECT NOW()');
    console.log('Database connection test successful:', testResult.rows[0]);
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
  
  let body;
  try {
    body = await request.json();
    console.log('Request body:', { code: !!body.code, deviceId: body.state });
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const code = body.code;
  const deviceId = body.state;

  if (!code || !deviceId) {
    console.error('Missing required parameters:', { code: !!code, deviceId: !!deviceId });
    return NextResponse.json(
      { error: 'Missing authorization code or device ID.' },
      { status: 400 }
    );
  }

  // Verify the device exists in database before proceeding
  try {
    const checkResult = await dataModel.checkRefreshToken({ id: deviceId });
    console.log('Device check result:', checkResult);
    if (!checkResult.success) {
      console.error('Failed to check device in database:', checkResult.error);
      return NextResponse.json(
        { error: 'Failed to verify device' },
        { status: 500 }
      );
    }
    if (checkResult.rows.length === 0) {
      console.error('Device not found in database:', deviceId);
      return NextResponse.json(
        { error: 'Device not registered' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);

  try {
    console.log('Requesting token from Spotify...');
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
    console.log('Spotify response status:', response.status);
    console.log('Spotify response contains refresh_token:', !!data.refresh_token);

    if (!response.ok) {
      console.error('Spotify API error:', data);
      return NextResponse.json(
        { error: 'Failed to exchange token with Spotify' },
        { status: response.status }
      );
    }

    const refreshToken = data.refresh_token;
    const accessToken = data.access_token;

    if (!refreshToken) {
      console.error('No refresh token in Spotify response:', data);
      return NextResponse.json(
        { error: 'No refresh token received from Spotify' },
        { status: 400 }
      );
    }

    console.log('Storing refresh token for device:', deviceId);
    const storeResult = await dataModel.storeRefreshToken({ id: deviceId, refresh_token: refreshToken });
    console.log('Store result:', storeResult);
    
    if (!storeResult.success) {
      console.error('Failed to store refresh token:', storeResult.error);
      return NextResponse.json(
        { error: 'Failed to store refresh token' },
        { status: 500 }
      );
    }

    console.log('Successfully stored refresh token for device:', deviceId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
} 