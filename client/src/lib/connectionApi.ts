import { apiUrl } from '@/config/api';
const API_BASE = apiUrl('/api/connections');

export async function sendConnectionRequest(recipientId: string, message?: string, serviceData?: { serviceName?: string; serviceId?: string; serviceLink?: string }) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ 
      recipientId, 
      message,
      initialMessage: message,
      serviceName: serviceData?.serviceName || '',
      serviceId: serviceData?.serviceId || '',
      serviceLink: serviceData?.serviceLink || ''
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to send connection request');
  }
  return res.json();
}

export async function getPendingRequests() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/pending`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to fetch pending requests');
  }
  return res.json();
}

export async function getSentRequests() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/sent`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to fetch sent requests');
  }
  return res.json();
}

export async function acceptConnectionRequest(requestId: string) {
  const token = localStorage.getItem('sehatkor_token');

  // First, try to get the request details from pending requests to retrieve service data
  let serviceData = null;
  try {
    const pendingRequests = await getPendingRequests();
    const request = pendingRequests.find((r: any) => String(r._id) === String(requestId));
    if (request) {
      serviceData = {
        serviceName: request.serviceName,
        serviceId: request.serviceId,
        serviceLink: request.serviceLink,
        sender: request.sender
      };
    }
  } catch (error) {
    // Continue without service data if we can't fetch it
  }

  const res = await fetch(`${API_BASE}/accept/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to accept request');
  }
  const result = await res.json();

  // After accepting, automatically send the service details to the chat if they exist
  try {
    if (serviceData && (serviceData.serviceName || serviceData.serviceId)) {
      // Import chat functions dynamically to avoid circular dependencies
      const { getOrCreateConversation } = await import('@/lib/chatApi');
      const { getSocket } = await import('@/lib/socket');

      // Get the sender's user ID from the service data
      const senderId = serviceData.sender?._id || serviceData.sender;
      if (senderId) {
        // Create or get the conversation
        const conversation = await getOrCreateConversation(senderId);

        // Prepare the service message using the data from the pending request
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sehatkor.cloud';

        let serviceMessage = `🎯 Service Connection Established!\n\n`;
        if (serviceData.serviceName) {
          serviceMessage += `💡 I am interested in your service: **${serviceData.serviceName}**\n\n`;
        }
        serviceMessage += `📋 **Service Details:**\n`;
        if (serviceData.serviceName) {
          serviceMessage += `• Service: ${serviceData.serviceName}\n`;
        }
        if (serviceData.serviceLink || serviceData.serviceId) {
          const serviceLink = serviceData.serviceLink || `${baseUrl}/service/${serviceData.serviceId}`;
          serviceMessage += `• 🔗 View Details: ${serviceLink}\n`;
        }
        serviceMessage += `\n💬 Ready to discuss details? Send a message to get started!`;

        // Send the message via socket
        const socket = getSocket();
        await new Promise<void>((resolve) => {
          socket.emit('send_message', {
            conversationId: conversation._id,
            recipientId: senderId,
            type: 'text',
            text: serviceMessage
          }, () => resolve());
        });
      }
    }
  } catch (error) {
    // Silently fail - don't break the accept flow if message sending fails
    console.warn('Failed to send service details to chat after accepting request:', error);
  }

  return result;
}

export async function rejectConnectionRequest(requestId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/reject/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to reject request');
  }
  return res.json();
}

export async function cancelConnectionRequest(requestId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/cancel/${requestId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to cancel request');
  }
  return res.json();
}

export async function deleteConnectionRequest(requestId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/delete/${requestId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to delete request');
  }
  return res.json();
}

export async function deleteUserConnection(userId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/remove-connection/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to remove connection');
  }
  return res.json();
}

export async function getConnectedUsers() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/connected`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to fetch connected users');
  }
  return res.json();
}

export async function searchUsersForConnection(query: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to search users');
  }
  return res.json();
}
