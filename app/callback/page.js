"use client"
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Create a separate component for the callback logic
function CallbackContent() {
  const [status, setStatus] = useState('Processing Spotify authorization...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      // Use the state directly as the device ID
      const deviceId = state;
      
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
          body: JSON.stringify({ code, state: deviceId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Authentication failed');
        }

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
                sessionId: deviceId,
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in
              }),
            });
          } catch (error) {
            console.error('Error broadcasting auth:', error);
          }
          
          // Show success status
          setStatus('Setup Complete! Your device has been successfully connected to your Spotify account.');
          
          // Navigate back automatically after 5 seconds
          setTimeout(() => {
            router.push('/setup');
          }, 5000);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus(`Authentication failed: ${error.message}. Please try again.`);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-lg border border-red-950/10">
      <div className="mb-6">
        {status.includes('Complete') ? (
          <div className="text-green-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : status.includes('Error') || status.includes('failed') ? (
          <div className="text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          <div className="text-blue-600 mb-4 animate-spin">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        )}
      </div>
      <h1 className="text-2xl font-bold text-red-950 mb-4">Spotify Authentication</h1>
      <p className="text-red-950/80">{status}</p>
      {(status.includes('Error') || status.includes('failed')) && (
        <button 
          onClick={() => router.push('/setup')} 
          className="mt-4 px-4 py-2 bg-red-950 text-white rounded hover:bg-red-900"
        >
          Return to Setup
        </button>
      )}
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