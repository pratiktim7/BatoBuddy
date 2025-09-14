/// <reference types="vite/client" />

// Google Maps API loader utility
let isGoogleMapsLoaded = false;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export const loadGoogleMapsAPI = (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    console.log('API Key from environment:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!apiKey) {
      const error = new Error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
      console.error(error.message);
      reject(error);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded');
      isGoogleMapsLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    console.log('Loading Google Maps script...');

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,directions`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      isGoogleMapsLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      console.error('Google Maps script failed to load:', error);
      isLoading = false;
      reject(new Error(`Failed to load Google Maps API: ${error}`));
    };

    // Append script to head
    document.head.appendChild(script);
  });

  return loadPromise;
};

// Check if Google Maps API is loaded
export const isGoogleMapsAPILoaded = (): boolean => {
  return isGoogleMapsLoaded || !!(window.google && window.google.maps);
};

// Global type declarations for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}
