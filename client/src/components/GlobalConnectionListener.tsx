import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getPendingRequests } from "@/lib/connectionApi";
import { getSocket } from "@/lib/socket";

const GlobalConnectionListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('sehatkor_token');
    if (!token) return;

    // Check for pending requests on app load
    const checkPendingRequests = async () => {
      try {
        const requests = await getPendingRequests();
        if (requests && requests.length > 0) {
          toast({
            title: `📋 ${requests.length} Pending Request${requests.length > 1 ? 's' : ''}`,
            description: "You have pending connection requests. Check your connections tab.",
            duration: 7000, // Show for 7 seconds
          });
        }
      } catch (error) {
        console.error('Failed to check pending requests:', error);
      }
    };

    // Check after a short delay to ensure socket is connected
    setTimeout(checkPendingRequests, 2000);

    let socket: any;
    try {
      socket = getSocket();

      // Ensure socket is connected
      if (!socket.connected) {
        socket.connect();
      }

      console.log('🔌 GlobalConnectionListener: Socket connected:', socket.connected);
    } catch (error) {
      console.error('❌ GlobalConnectionListener: Socket connection error:', error);
      return;
    }

    // Listen for new connection requests (works even when chat is closed)
    const onNewConnectionRequest = (data: any) => {
      console.log('🔔 Global: New connection request received:', data);

      // Play notification sound (even when chat is closed)
      try {
        const audio = new Audio('/sounds/abu.wav');
        audio.volume = 1.0; // Full volume
        audio.play()
          .then(() => console.log('✅ Global: Notification sound played'))
          .catch(err => console.log('❌ Global: Could not play notification sound:', err));
      } catch (err) {
        console.log('❌ Global: Notification sound error:', err);
      }

      // Show toast with service details if available
      const description = data.serviceName
        ? `${data.sender?.name || 'Someone'} is interested in your service "${data.serviceName}"`
        : data.message || "You have a new connection request";

      toast({
        title: "🔔 New Connection Request",
        description: description,
        duration: 5000, // Show for 5 seconds
      });
    };

    socket.on('new_connection_request', onNewConnectionRequest);

    return () => {
      socket?.off('new_connection_request', onNewConnectionRequest);
    };
  }, [toast]);

  // This component doesn't render anything
  return null;
};

export default GlobalConnectionListener;
