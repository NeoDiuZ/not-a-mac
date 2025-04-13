import { NextResponse } from 'next/server';
import dataModel from '../../../models/dataModel';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mac = searchParams.get('id');

    if (!mac) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const result = await dataModel.checkRefreshToken({ id: mac });
    if (result.rows.length === 0 || !result.rows[0].refresh_token) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 404 });
    }

    return NextResponse.json({ refresh_token: result.rows[0].refresh_token }, { status: 200 });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
