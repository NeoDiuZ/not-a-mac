"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const SpotifyContext = createContext(null);

export function useSpotify() {
  return useContext(SpotifyContext);
}

export function SpotifyProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('spotify_access_token');
    const expiry = localStorage.getItem('spotify_token_expiry');
    
    if (token && expiry && Date.now() < Number(expiry)) {
      setAccessToken(token);
      setIsAuthenticated(true);
    } else {
      setAccessToken(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const value = {
    isAuthenticated,
    accessToken,
    loading,
    refreshAuth: checkAuthStatus,
  };

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
} 