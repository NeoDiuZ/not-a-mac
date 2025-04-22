"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ArrowRight } from 'lucide-react';

export default function Setup() {
  const [deviceId, setDeviceId] = useState(Array(12).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Create refs outside the callback to fix the React hook error
  const inputRefs = useRef(Array(12).fill(null));

  const handleInputChange = (index, value) => {
    // Allow digits and letters
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;
    
    const newDeviceId = [...deviceId];
    // Convert to uppercase if it's a letter
    newDeviceId[index] = value.slice(0, 1).toUpperCase(); 
    setDeviceId(newDeviceId);

    // Auto-focus to next input when this one is filled
    if (value && index < 11) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && deviceId[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 11) {
      inputRefs.current[index + 1].focus();
    }
  };

  const getFullDeviceId = () => {
    return deviceId.join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const fullDeviceId = getFullDeviceId();
    if (fullDeviceId.length !== 12) {
      setError('Device ID must be 12 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/spotify/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mac: fullDeviceId }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.redirectTo) {
        // Navigate to success page
        router.push(data.redirectTo);
        return;
      }
      
      if (data.authUrl) {
        // Redirect to Spotify auth page
        window.location.href = data.authUrl;
        return;
      }
      
      // Fallback error if we got here
      setError('Unexpected response from server');
    } catch (err) {
      console.error('Error registering device:', err);
      setError('Failed to register device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute w-[40vw] h-[40vw] rounded-full bg-black/[0.02] blur-[80px]"
          style={{ left: '10%', top: '10%' }}></div>
        <div className="absolute w-[45vw] h-[45vw] rounded-full bg-black/[0.02] blur-[100px]"
          style={{ right: '15%', top: '30%' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-fit mx-auto border border-black/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Music className="w-6 h-6 text-black" />
              <h1 className="text-3xl font-bold">Device Setup</h1>
            </div>
            <p className="text-black/80">
              Enter your device ID to connect with Spotify
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="grid grid-cols-4 gap-3 px-4 max-w-[280px] mx-auto">
                {Array(12).fill(0).map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={deviceId[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="0"
                    className="w-full h-12 text-center font-mono text-base rounded-md bg-white/70 border border-black/20 focus:border-black/60 focus:ring-1 focus:ring-black/30 focus:outline-none shadow-sm"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {error && <p className="mt-2 text-red-600 text-sm text-center">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-black/80 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-black/50"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Connect to Spotify</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-black/70 text-sm">
        <p>© 2025 Not-A-Mac. All rights reserved.</p>
      </footer>
    </div>
  );
}