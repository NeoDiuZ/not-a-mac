"use client"
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Create a separate component for the callback logic
function CallbackContent() {
  const [status, setStatus] = useState('Processing...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const sessionId = state?.split('-').pop(); // Extract session ID from state
      
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
          // Store tokens in localStorage
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
          localStorage.setItem('spotify_token_expiry', Date.now() + (data.expires_in * 1000));
          
          // Broadcast success through a shared endpoint
          try {
            await fetch('/api/spotify/broadcast-auth', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in
              }),
            });
          } catch (error) {
            console.error('Error broadcasting auth:', error);
          }
          
          setStatus('Authorization successful! You can close this window.');
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-red-950/10">
      <h1 className="text-2xl font-bold text-red-950 mb-4">Spotify Authentication</h1>
      <p className="text-red-950/80">{status}</p>
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-red-950/10">
      <h1 className="text-2xl font-bold text-red-950 mb-4">Loading...</h1>
    </div>
  );
}

// Main component with Suspense boundary
export default function SpotifyCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDD0]">
      <Suspense fallback={<LoadingState />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
} 