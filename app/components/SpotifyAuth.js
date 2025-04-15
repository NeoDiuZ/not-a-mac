"use client";
import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useSpotify } from './SpotifyProvider';
import CurrentlyPlaying from './CurrentlyPlaying';

export default function SpotifyAuth() {
  const { isAuthenticated, loading, refreshAuth } = useSpotify();
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      fetchAuthUrl();
    }
  }, [isAuthenticated]);

  const fetchAuthUrl = async () => {
    try {
      const response = await fetch('/api/spotify/auth-url');
      const data = await response.json();
      setAuthUrl(data.url);
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleLogin = () => {
    const width = 450;
    const height = 730;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'Spotify Login',
      `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    // Poll for auth completion
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        refreshAuth();
      }
    }, 500);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="py-12 px-4 bg-black/5 backdrop-blur-md">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 mb-8">
          <Music className="w-6 h-6 text-red-950" />
          <h2 className="text-3xl font-bold text-red-950">Connect with Spotify</h2>
        </div>
        
        {isAuthenticated ? (
          <div>
            <p className="text-xl text-red-950/80 mb-8">Your Spotify account is connected!</p>
            <CurrentlyPlaying />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-xl text-red-950/80 mb-8">
              Scan the QR code to connect your Spotify account
            </p>
            {authUrl && (
              <div 
                className="bg-white p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                onClick={handleLogin}
              >
                <QRCodeSVG 
                  value={authUrl}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            )}
            <p className="text-sm text-red-950/60">
              Or click the button below
            </p>
            <button
              onClick={handleLogin}
              className="bg-[#1DB954] text-white px-8 py-3 rounded-lg font-medium 
                       hover:bg-[#1ed760] transition-all duration-300
                       transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"
            >
              <Music className="w-5 h-5" />
              <span>Connect Spotify</span>
            </button>
            <p className="mt-8 text-sm text-red-950/60">
              For device setup, <a href="/setup" className="text-red-950 underline hover:text-red-800">click here</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 