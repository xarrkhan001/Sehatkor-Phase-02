import { io, Socket } from 'socket.io-client';

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
    socket = io('http://localhost:4000', {
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 15000,
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


