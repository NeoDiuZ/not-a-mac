"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Clock, ShoppingBag, Sparkles, Recycle, Bot, Lock, Music, Heart, Globe, Zap, Star, Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AnimatedBackground = () => {
  return (
    <>
      {/* Base cream background */}
      <div className="absolute inset-0 bg-[#FFFDD0]"></div>
      {/* Floating red smudge effect */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-[40vw] h-[40vw] rounded-full bg-[#FF0000]/70 blur-[80px]
                     motion-safe:animate-[float1_20s_ease-in-out_infinite]"
          style={{ left: '10%', top: '10%' }}
        ></div>
        <div 
          className="absolute w-[45vw] h-[45vw] rounded-full bg-[#FF0000]/60 blur-[100px]
                     motion-safe:animate-[float2_25s_ease-in-out_infinite]"
          style={{ right: '15%', top: '30%' }}
        ></div>
        <div 
          className="absolute w-[35vw] h-[35vw] rounded-full bg-[#FF0000]/65 blur-[60px]
                     motion-safe:animate-[float3_15s_ease-in-out_infinite]"
          style={{ left: '30%', bottom: '20%' }}
        ></div>
      </div>
    </>
  );
};

const CurrentlyPlaying = ({ authToken }) => {
  const [trackInfo, setTrackInfo] = useState(null);
  const [error, setError] = useState(null);
  const [currentToken, setCurrentToken] = useState(authToken);
  const lastFetchRef = useRef(0);
  const minFetchInterval = 3000;
  const trackInfoRef = useRef(null);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', Date.now() + (data.expires_in * 1000));
        return data.access_token;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };

  const getValidToken = async () => {
    const expiry = localStorage.getItem('spotify_token_expiry');
    const storedToken = localStorage.getItem('spotify_access_token');

    if (!expiry || !storedToken) return null;

    if (Date.now() > Number(expiry) - 60000) {
      const newToken = await refreshAccessToken();
      return newToken;
    }

    return storedToken;
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchNowPlaying = async () => {
      const now = Date.now();
      if (now - lastFetchRef.current < minFetchInterval) {
        return;
      }

      try {
        const validToken = await getValidToken();
        if (!validToken || !isMounted) return;

        const response = await fetch('/api/spotify/now-playing', {
          headers: {
            'Authorization': `Bearer ${validToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const data = await response.json();
        if (!isMounted) return;

        if (data.error) {
          setError(data.error);
          return;
        }

        // Compare with previous data using ref
        const prevData = trackInfoRef.current;
        const isNewData = JSON.stringify(data) !== JSON.stringify(prevData);
        
        if (isNewData) {
          trackInfoRef.current = data;
          setTrackInfo(data);
          setError(null);
        }

        lastFetchRef.current = now;
      } catch (error) {
        console.error('Error fetching now playing:', error);
        if (isMounted) {
          setError('Failed to fetch current track');
        }
      }
    };

    const startPolling = () => {
      fetchNowPlaying();
      timeoutId = setInterval(fetchNowPlaying, 5000);
    };

    if (currentToken) {
      startPolling();
    }

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [currentToken]);

  if (!currentToken) {
    return null;
  }

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
};

const LandingPage = () => {
  const [designerName, setDesignerName] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [spotifyAuthUrl, setSpotifyAuthUrl] = useState('');
  const hasLoadedUrl = React.useRef(false);
  
  const designerNames = [
    '???'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomName = designerNames[Math.floor(Math.random() * designerNames.length)];
      setDesignerName(randomName);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const futureDate = new Date('2025-02-01').getTime();
      const now = new Date().getTime();
      const distance = futureDate - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedUrl.current && !spotifyAuthUrl) {
      const getAuthUrl = async () => {
        try {
          const response = await fetch('/api/spotify/auth-url');
          const data = await response.json();
          setSpotifyAuthUrl(data.url);
        } catch (error) {
          console.error('Error getting auth URL:', error);
        }
      };
      getAuthUrl();
      hasLoadedUrl.current = true;
    }
  }, [spotifyAuthUrl]);

  const CountdownBox = ({ value, label }) => (
    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg transform hover:scale-105 transition-transform duration-300">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );

  const Stats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16">
      <StatBox number="100%" text="Eco-Friendly" />
      <StatBox number="1/1" text="Uniqueness" />
      <StatBox number="0" text="Carbon Footprint" />
      <StatBox number="∞" text="Style Points" />
    </div>
  );

  const StatBox = ({ number, text }) => (
    <div className="text-center">
      <p className="text-4xl font-bold text-red-950">{number}</p>
      <p className="text-sm text-red-950/70">{text}</p>
    </div>
  );

  const handleSpotifyLogin = async () => {
    const width = 450;
    const height = 730;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/api/spotify',
      'Spotify Login',
      `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  const handleQRCodeClick = () => {
    if (spotifyAuthUrl) {
      const width = 450;
      const height = 730;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        spotifyAuthUrl,
        'Spotify Login',
        `menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
    }
  };

  const SpotifyAuthSection = () => {
    // Move state and polling logic inside the component
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const pollIntervalRef = useRef(null);
    const sessionIdRef = useRef(null);

    // Setup polling and auth check
    useEffect(() => {
      const checkAuth = () => {
        const accessToken = localStorage.getItem('spotify_access_token');
        const tokenExpiry = localStorage.getItem('spotify_token_expiry');
        
        if (accessToken && tokenExpiry && Date.now() < Number(tokenExpiry)) {
          setIsAuthenticated(true);
          setAuthToken(accessToken);
          return true;
        }
        return false;
      };

      // Initial auth check
      if (checkAuth()) return;

      // Setup polling for auth status
      const setupAuthPolling = async () => {
        try {
          const response = await fetch('/api/spotify/auth-url');
          const data = await response.json();
          setSpotifyAuthUrl(data.url);
          sessionIdRef.current = data.sessionId;

          // Start polling
          pollIntervalRef.current = setInterval(async () => {
            try {
              const statusResponse = await fetch(`/api/spotify/broadcast-auth?sessionId=${sessionIdRef.current}`);
              const statusData = await statusResponse.json();

              if (statusData.accessToken) {
                // Update local storage
                localStorage.setItem('spotify_access_token', statusData.accessToken);
                localStorage.setItem('spotify_refresh_token', statusData.refreshToken);
                localStorage.setItem('spotify_token_expiry', Date.now() + (statusData.expiresIn * 1000));
                
                setIsAuthenticated(true);
                setAuthToken(statusData.accessToken);
                
                // Clear polling
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
              }
            } catch (error) {
              console.error('Error polling auth status:', error);
            }
          }, 2000);
        } catch (error) {
          console.error('Error getting auth URL:', error);
        }
      };

      setupAuthPolling();

      // Cleanup
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }, []); // Empty dependency array since we want this to run once

    return (
      <div className="py-12 px-4 bg-black/5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 mb-8">
            <Music className="w-6 h-6 text-red-950" />
            <h2 className="text-3xl font-bold text-red-950">Connect with Spotify</h2>
          </div>
          <p className="text-xl text-red-950/80 mb-8">
            {isAuthenticated 
              ? "Your Spotify account is connected!" 
              : "Scan the QR code to connect your Spotify account"}
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col items-center space-y-4">
              {spotifyAuthUrl && (
                <div 
                  className="bg-white p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={handleQRCodeClick}
                >
                  <QRCodeSVG 
                    value={spotifyAuthUrl}
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
                onClick={handleSpotifyLogin}
                className="bg-[#1DB954] text-white px-8 py-3 rounded-lg font-medium 
                         hover:bg-[#1ed760] transition-all duration-300
                         transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"
              >
                <Music className="w-5 h-5" />
                <span>Connect Spotify</span>
              </button>
            </div>
          ) : (
            <CurrentlyPlaying authToken={authToken} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white font-light relative antialiased">
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#FFFDD0]/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-black to-red-950 leading-tight">
              Drop #39<br/>Not-A-Mac
            </h1>
            <p className="text-2xl mb-8 text-red-950 font-normal italic tracking-wide">
              An aesthetic desk accessory that allows users to display and interact with their music
            </p>
            <div className="flex justify-center space-x-4 mb-12">
              <CountdownBox value={timeLeft.days} label="Days" />
              <CountdownBox value={timeLeft.hours} label="Hours" />
              <CountdownBox value={timeLeft.minutes} label="Minutes" />
              <CountdownBox value={timeLeft.seconds} label="Seconds" />
            </div>
            <button className="bg-white/10 backdrop-blur-sm text-red-950 px-8 py-3 rounded-lg font-medium 
                             hover:bg-white/20 transition-all duration-300 border border-red-950/20
                             hover:border-red-950/40 tracking-wide transform hover:scale-105">
              Join Waitlist
            </button>
            <Stats />
          </div>
        </div>

        {/* Add SpotifyAuthSection before the Vision Section */}
        <SpotifyAuthSection />

        {/* Vision Section */}
        <div className="py-24 px-4 bg-black/5 backdrop-blur-md">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 mb-8">
              <h2 className="text-3xl font-bold text-red-950">Our Vision</h2>
            </div>
            <p className="text-2xl text-red-950/90 max-w-3xl mx-auto leading-relaxed">
              We believe in creating products that are not just aesthetically pleasing, but also 
              environmentally conscious. Each Not-A-Mac tells a story of innovation, sustainability, 
              and uncompromising style.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 px-4 bg-black/5 backdrop-blur-md">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 mb-8">
                <Zap className="w-6 h-6 text-red-950" />
                <h2 className="text-3xl font-bold text-red-950">Features</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                Icon={Recycle}
                title="Eco-Friendly"
                description="Crafted from ethically self-sourced plastic waste"
              />
              <FeatureCard 
                Icon={Bot}
                title="Robotic Precision"
                description="State-of-the-art manufacturing process"
              />
              <FeatureCard 
                Icon={Sparkles}
                title="Unique Identity"
                description="Each piece numbered with its own personality"
              />
              <FeatureCard 
                Icon={Music}
                title="Music Integration"
                description="Seamlessly display and control your music"
              />
              <FeatureCard 
                Icon={Globe}
                title="Sustainable Impact"
                description="Zero carbon footprint manufacturing"
              />
              <FeatureCard 
                Icon={Award}
                title="Limited Edition"
                description="Exclusive numbered pieces"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description Section */}
        <div className="py-24 px-4 bg-black/10 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="text-center mt-16">
                <p className="text-2xl font-medium text-red-950 italic">
                  A fusion of cutting-edge eco-tech and robotic artistry, designed for those who demand sustainability 
                  with style, swag, and a sprinkle of Za. Limited edition, endlessly iconic, and built for legends like you.
                </p>
                <div className="mt-8 relative">
                  <p className="text-4xl font-bold text-red-950 relative z-10">
                    Be what you could be.
                  </p>
                  <div className="absolute inset-0 bg-red-950/5 blur-lg transform -rotate-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Preview */}
        <div className="py-24 px-4 bg-black/5 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 mb-8">
              <ShoppingBag className="w-6 h-6 text-red-950" />
              <h2 className="text-3xl font-bold text-red-950">Coming Soon</h2>
            </div>
            <div className="aspect-video bg-black/10 rounded-lg mb-8 flex items-center justify-center backdrop-blur-sm 
                          border border-red-950/10 hover:border-red-950/20 transition-all duration-300
                          transform hover:scale-105">
              <Lock className="w-16 h-16 text-red-950/40" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-red-900/10 bg-black/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-red-950/60 mb-4 md:mb-0">© 2025 Not-A-Mac. All rights reserved.</p>
            <div className="flex space-x-6">
              <FooterLink href="#" text="Privacy" />
              <FooterLink href="#" text="Terms" />
              <FooterLink href="#" text="Contact" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const FeatureCard = ({ Icon, title, description }) => (
  <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-red-950/10 
                  hover:border-red-950/20 transition-all duration-300 transform hover:scale-105">
    <Icon className="w-12 h-12 mx-auto mb-4 text-red-950" />
    <h3 className="text-2xl font-bold mb-2 text-red-950">{title}</h3>
    <p className="text-red-950/80 font-normal">{description}</p>
  </div>
);

const FooterLink = ({ href, text }) => (
  <a href={href} 
     className="text-red-950/60 hover:text-red-950 transition-colors duration-300">
    {text}
  </a>
);

export default LandingPage;