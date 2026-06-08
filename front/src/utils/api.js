/**
 * Generates backend URLs dynamically based on environment variables and active hostname.
 * 
 * @param {string} path - The endpoint path
 * @param {boolean} isWs - Whether the request is a WebSocket connection
 * @returns {string} - Complete resolved URL
 */
export const getBackendUrl = (path, isWs = false) => {
  // Read from environment variables in Astro
  const envUrl = isWs 
    ? import.meta.env.PUBLIC_WS_URL 
    : import.meta.env.PUBLIC_API_URL;
    
  const baseUrl = envUrl || (isWs ? 'ws://localhost:3000' : 'http://localhost:3000');
  
  // Dynamic LAN IP resolution logic (helps mobile students connect to local developer machine)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return baseUrl.replace('localhost', window.location.hostname) + path;
  }
  
  return `${baseUrl}${path}`;
};
