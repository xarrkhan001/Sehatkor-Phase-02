import { apiUrl } from '@/config/api';
const API_BASE = apiUrl('/api/connections');

export async function sendConnectionRequest(recipientId: string, message?: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch(`${API_BASE}/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ recipientId, message }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to send connection request');
  }
  return res.json();
}

export async function sendConnectionRequestWithMessage(recipientId: string, initialMessage: string, serviceName?: string) {
  const token = localStorage.getItem('sehatkor_token');
  const message = `I would like to connect with you regarding "${serviceName || 'your service'}". ${initialMessage}`;
  
  // Fallback to regular connection request if new endpoint is not available
  try {
    const res = await fetch(`${API_BASE}/request-with-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ 
        recipientId, 
        message,
        initialMessage,
        serviceName 
      }),
    });
    if (!res.ok) {
      // If 404, fall back to regular request
      if (res.status === 404) {
        return sendConnectionRequest(recipientId, message);
      }
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to send connection request with message');
    }
    return res.json();
  } catch (error) {
    // If network error or endpoint not found, use fallback
    console.warn('Falling back to regular connection request:', error);
    return sendConnectionRequest(recipientId, message);
  }
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
  return res.json();
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
