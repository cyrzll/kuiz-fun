const getBackendUrl = (path, isWs = false) => {
  const envUrl = isWs ? "ws://localhost:3000" : "https";
  const baseUrl = envUrl;
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return baseUrl.replace("localhost", window.location.hostname) + path;
  }
  return `${baseUrl}${path}`;
};

export { getBackendUrl as g };
