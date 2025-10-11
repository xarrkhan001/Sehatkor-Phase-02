import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@/config/api';

let socket: Socket | null = null;
let lastToken: string | null = null;

export function getSocket(): Socket {
  const token = localStorage.getItem('sehatkor_token');
  if (!token) {
    throw new Error('Missing auth token');
  }
  const shouldReconnect = !socket || !socket.connected || lastToken !== token;
  if (shouldReconnect) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    lastToken = token;
    const baseUrl = SOCKET_BASE_URL;
    const socketPath = (import.meta as any).env?.VITE_SOCKET_PATH; // optional
    socket = io(baseUrl, {
      // Send token in both places to match different server handlers
      auth: { token },
      query: { token },
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket'], // Use only WebSocket for faster connection
      upgrade: false, // Disable polling fallback for faster connection
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 10000, // Faster timeout
      ...(socketPath ? { path: socketPath } : {}),
    });
  }
  return socket as Socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    lastToken = null;
  }
}
