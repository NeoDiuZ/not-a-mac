"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ArrowRight } from 'lucide-react';

export default function Setup() {
  const [deviceId, setDeviceId] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputRefs = [useRef(null), useRef(null), useRef(null)];

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDeviceId = [...deviceId];
    newDeviceId[index] = value;
    setDeviceId(newDeviceId);

    // Auto-focus to next input when this one is filled
    if (value.length === 4 && index < 2) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && deviceId[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
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
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-950/10">
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
              <label htmlFor="deviceId" className="block text-sm font-medium mb-2">
                Device ID
              </label>
              <div className="flex space-x-3 justify-center">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="w-full">
                    <input
                      ref={inputRefs[index]}
                      type="text"
                      maxLength={4}
                      value={deviceId[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      placeholder="0000"
                      className="w-full px-2 py-3 rounded-lg bg-white/50 border border-red-950/20 focus:border-red-950/40 focus:outline-none text-center font-mono text-lg"
                      disabled={isLoading}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-center text-red-950/60">Enter your 12-digit device ID</p>
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

          <div className="mt-6 text-center text-sm text-red-950/60">
            <p>
              This will connect your device to your Spotify account for music display
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-red-950/70 text-sm">
        <p>© 2025 Not-A-Mac. All rights reserved.</p>
      </footer>
    </div>
  );
}