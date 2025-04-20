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
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div></div>;
  }

  return (
    <section className="relative py-24 px-4 bg-black text-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="uppercase tracking-widest text-xs font-medium text-white/70 mb-2">Music Integration</p>
          <h2 className="text-3xl md:text-4xl font-light mb-4">Connect Your Music</h2>
          <p className="text-white/70 max-w-xl mx-auto">
            Not-A-Mac seamlessly integrates with your Spotify account for a cohesive music experience
          </p>
        </div>
        
        {isAuthenticated ? (
          <div className="max-w-md mx-auto">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mb-4">
                <Music className="w-5 h-5 text-white" />
              </div>
              <p className="text-white/80">Your Spotify account is connected</p>
            </div>
            <CurrentlyPlaying />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center">
              {authUrl && (
                <div
                  onClick={handleLogin}
                  className="bg-white p-6 rounded-md cursor-pointer mb-8 transition-transform duration-300 hover:scale-105"
                >
                  <QRCodeSVG
                    value={authUrl}
                    size={240}
                    level="H"
                    includeMargin={true}
                    className="rounded-sm"
                  />
                </div>
              )}
              
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 px-6 py-3 border border-white/20 hover:bg-white hover:text-black transition-all duration-300"
              >
                <Music className="w-5 h-5" />
                <span>Connect with Spotify</span>
              </button>
              
              <p className="mt-10 text-xs text-white/50 uppercase tracking-widest">
                For device setup, <a href="/setup" className="underline hover:text-white">visit the setup page</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 