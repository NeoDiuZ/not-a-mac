"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ArrowRight } from 'lucide-react';

export default function Setup() {
  const [deviceId, setDeviceId] = useState(Array(12).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputRefs = Array(12).fill(0).map(() => useRef(null));

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDeviceId = [...deviceId];
    newDeviceId[index] = value.slice(0, 1); // Only take the first digit
    setDeviceId(newDeviceId);

    // Auto-focus to next input when this one is filled
    if (value && index < 11) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && deviceId[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 11) {
      inputRefs[index + 1].current.focus();
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
      setError('Device ID must be 12 digits');
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

      if (response.redirected) {
        // Follow the redirect
        window.location.href = response.url;
      } else {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err) {
      console.error('Error registering device:', err);
      setError('Failed to register device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0] text-red-950 flex flex-col">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute w-[40vw] h-[40vw] rounded-full bg-[#FF0000]/70 blur-[80px]"
          style={{ left: '10%', top: '10%' }}></div>
        <div className="absolute w-[45vw] h-[45vw] rounded-full bg-[#FF0000]/60 blur-[100px]"
          style={{ right: '15%', top: '30%' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl w-fit mx-auto border border-red-950/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Music className="w-6 h-6 text-red-950" />
              <h1 className="text-3xl font-bold">Device Setup</h1>
            </div>
            <p className="text-red-950/80">
              Enter your device ID to connect with Spotify
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="grid grid-cols-4 gap-2 md:grid-cols-none md:flex md:justify-center md:items-center md:gap-6 px-2">
                {Array(12).fill(0).map((_, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text" //added mobile responsiveness
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={deviceId[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    placeholder="0"
                    className="w-12 h-12 md:w-8 md:h-10 text-center font-mono text-base rounded-md bg-white/70 border border-red-950/20 focus:border-red-950/60 focus:ring-1 focus:ring-red-950/30 focus:outline-none shadow-sm"
                    disabled={isLoading}
                  />
                ))}
              </div>
              {error && <p className="mt-2 text-red-600 text-sm text-center">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-red-950 text-white py-3 px-4 rounded-lg hover:bg-red-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-950/50"
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
      <footer className="relative z-10 py-4 text-center text-red-950/70 text-sm">
        <p>© 2025 Not-A-Mac. All rights reserved.</p>
      </footer>
    </div>
  );
}