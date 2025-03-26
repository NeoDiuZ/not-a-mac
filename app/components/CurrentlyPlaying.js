"use client";
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { useSpotify } from './SpotifyProvider';

export default function CurrentlyPlaying() {
  const { accessToken } = useSpotify();
  const [trackInfo, setTrackInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    let pollInterval;

    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('/api/spotify/now-playing', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        if (!mounted) return;

        if (data.error) {
          setError(data.error);
          return;
        }

        setTrackInfo(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching now playing:', error);
        if (mounted) setError('Failed to fetch current track');
      }
    };

    if (accessToken) {
      fetchNowPlaying();
      pollInterval = setInterval(fetchNowPlaying, 5000);
    }

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [accessToken]);

  if (error) {
    return <div className="text-red-950/70">Error: {error}</div>;
  }

  if (!trackInfo || !trackInfo.isPlaying) {
    return <div className="text-red-950/70">No track currently playing</div>;
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-red-950/10 
                    hover:border-red-950/20 transition-all duration-300 max-w-sm mx-auto">
      <div className="flex items-center space-x-4">
        {trackInfo.albumArt && (
          <img 
            src={trackInfo.albumArt} 
            alt={trackInfo.album}
            className="w-16 h-16 rounded-md"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-red-950 font-medium truncate">{trackInfo.title}</p>
          <p className="text-red-950/70 text-sm truncate">{trackInfo.artist}</p>
          <p className="text-red-950/50 text-xs truncate">{trackInfo.album}</p>
        </div>
        <Music className="w-6 h-6 text-red-950/50 flex-shrink-0" />
      </div>
    </div>
  );
} 