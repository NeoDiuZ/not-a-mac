"use client";
import { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
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
    return (
      <div className="relative p-4 border border-white/10 text-center">
        <p className="text-white/50 text-sm">{error}</p>
      </div>
    );
  }

  if (!trackInfo || !trackInfo.isPlaying) {
    return (
      <div className="relative p-6 border border-white/10 text-center">
        <Music className="w-8 h-8 text-white/30 mx-auto mb-2" />
        <p className="text-white/50 text-sm">No track currently playing</p>
      </div>
    );
  }

  return (
    <div className="relative border border-white/10">
      {trackInfo.albumArt && (
        <div className="aspect-square bg-white/5 overflow-hidden">
          <img 
            src={trackInfo.albumArt} 
            alt={trackInfo.album}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-lg font-medium">{trackInfo.title}</p>
          <p className="text-white/70 text-sm">{trackInfo.artist}</p>
          <p className="text-white/50 text-xs mt-1">{trackInfo.album}</p>
        </div>
        
        <div className="flex justify-center items-center space-x-6">
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <button className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
            <Play className="w-5 h-5" />
          </button>
          <button className="text-white/70 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 