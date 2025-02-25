"use client"
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SpotifyCallback() {
  const [status, setStatus] = useState('Processing...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      if (!code) {
        setStatus('Error: No authorization code received');
        return;
      }

      try {
        const response = await fetch('/api/spotify/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        
        if (data.access_token) {
          localStorage.setItem('spotify_auth_code', data.access_token);
          setStatus('Authorization successful! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDD0]">
      <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-red-950/10">
        <h1 className="text-2xl font-bold text-red-950 mb-4">Spotify Authentication</h1>
        <p className="text-red-950/80">{status}</p>
      </div>
    </div>
  );
} 