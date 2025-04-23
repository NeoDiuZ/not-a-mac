import { NextResponse } from 'next/server';
import dataModel from '../../models/dataModel';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const deviceId = body.id;
  if (!deviceId) {
    return NextResponse.json(
      { error: 'Missing id in body' },
      { status: 400 }
    );
  }

  const result = await dataModel.checkRefreshToken({ id: deviceId });
  if (!result.success) {
    console.error('Database error:', result.error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
  if (result.rows.length === 0 || !result.rows[0].refresh_token) {
    return NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ refresh_token: result.rows[0].refresh_token });
}
