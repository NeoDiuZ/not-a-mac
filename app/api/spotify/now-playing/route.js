export async function GET() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`,
      },
    });

    if (response.status === 204) {
      return Response.json({ isPlaying: false });
    }

    const data = await response.json();
    return Response.json({
      isPlaying: data.is_playing,
      title: data.item?.name,
      artist: data.item?.artists[0]?.name,
      album: data.item?.album?.name,
      albumArt: data.item?.album?.images[0]?.url,
    });
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return Response.json({ error: 'Failed to fetch currently playing track' }, { status: 500 });
  }
} 