import { NextResponse } from 'next/server';

// In a production environment, you'd want to use a proper database or cache
const authSessions = new Map();

export async function POST(request) {
  const { sessionId, accessToken, refreshToken, expiresIn } = await request.json();
  
  if (!sessionId || !accessToken) {
    return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
  }

  authSessions.set(sessionId, {
    accessToken,
    refreshToken,
    expiresIn,
    timestamp: Date.now()
  });

  return NextResponse.json({ success: true });
}

export async function GET(request) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const authData = authSessions.get(sessionId);
  
  if (!authData) {
    return NextResponse.json({ status: 'pending' });
  }

  // Clear the session data after retrieving it
  authSessions.delete(sessionId);
  
  return NextResponse.json(authData);
} 