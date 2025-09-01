import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface ISocketContext {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
            const token = localStorage.getItem('sehatkor_token');
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000', {
        query: { token },
      });

      setSocket(newSocket);

      newSocket.on('online_users', (users: string[]) => {
        setOnlineUsers(users);
      });

      // Listen for account termination events
      newSocket.on('account_terminated', (data: { userId: string; message: string; timestamp: string }) => {
        if (data.userId === user.id) {
          // Show termination message
          toast({
            title: "Account Terminated",
            description: data.message,
            variant: "destructive",
            duration: 10000, // Show for 10 seconds
          });
          
          // Force logout after a short delay
          setTimeout(() => {
            logout();
            window.location.href = '/login?terminated=true';
          }, 3000);
        }
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }

    return () => {};
  }, [user, logout, toast]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
