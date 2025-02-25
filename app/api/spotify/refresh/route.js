export async function POST(request) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return Response.json({ error: 'No refresh token provided' }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refresh_token);

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
    return Response.json(data);
  } catch (error) {
    console.error('Token refresh error:', error);
    return Response.json({ error: 'Failed to refresh token' }, { status: 500 });
  }
} 