"use client";
import React from 'react';
import { CheckCircle, Home, Music } from 'lucide-react';
import Link from 'next/link';

export default function Success() {
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
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-950/10 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          
          <h1 className="text-3xl font-bold mb-4">Setup Complete!</h1>
          
          <p className="text-lg text-red-950/80 mb-8">
            Your device has been successfully connected to your Spotify account.
            Your music will now display on your Not-A-Mac device.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="flex items-center justify-center space-x-2 bg-red-950 text-white py-3 px-6 rounded-lg hover:bg-red-900 transition-colors duration-300 w-full"
            >
              <Home className="w-5 h-5" />
              <span>Return Home</span>
            </Link>
            
            <Link
              href="/setup"
              className="flex items-center justify-center space-x-2 bg-white/50 text-red-950 py-3 px-6 rounded-lg border border-red-950/20 hover:bg-white/70 transition-colors duration-300 w-full"
            >
              <Music className="w-5 h-5" />
              <span>Setup Another Device</span>
            </Link>
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