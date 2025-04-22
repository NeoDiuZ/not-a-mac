import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('id');

  if (!deviceId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const result = await dataModel.checkRefreshToken({ id: deviceId });
    
    if (!result.success) {
      console.error('Database error:', result.error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (result.rows.length === 0 || !result.rows[0].refresh_token) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 404 });
    }

    return NextResponse.json({ refresh_token: result.rows[0].refresh_token });
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 