import { apiFetch, ENDPOINTS, apiUrl } from '@/config/api';

export async function fetchVerifiedUsers() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.verifiedUsers, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to fetch users');
  }
  return res.json();
}

export async function getOrCreateConversation(recipientId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.conversations, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ recipientId }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

// acceptConversation / rejectConversation removed (invitation flow disabled)

export async function fetchMessages(conversationId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.messages(conversationId), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function deleteMessage(messageId: string, scope: 'me' | 'everyone' = 'me') {
  const token = localStorage.getItem('sehatkor_token');
  const url = `${ENDPOINTS.chat.messages(messageId)}?scope=${scope}`;
  const res = await apiFetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to delete message');
  }
  return res.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.upload, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  let data: any = {};
  try { data = await res.json(); } catch {}
  if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
  const url = data.url || data.avatar;
  return { ...data, url };
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.profile.uploadImage, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  let data: any = {};
  try { data = await res.json(); } catch {}
  if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
  const url = data.url || data.avatar;
  return { ...data, url };
}

export async function fetchConversations() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.conversations, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function markAsRead(conversationId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.markRead, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ conversationId }),
  });
  if (!res.ok) throw new Error('Failed to mark read');
  return res.json();
}

export async function clearConversation(conversationId: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.chat.conversationMessages(conversationId), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to clear conversation');
  }
  return res.json();
}

export async function fetchMyProfile() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.profile.root, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function updateMyProfile(updates: Record<string, any>) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.profile.root, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to update profile');
  }
  return res.json();
}

export async function removeProfileImage() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(ENDPOINTS.profile.image, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  let data: any = {};
  try { data = await res.json(); } catch {}
  if (!res.ok || data?.success === false) {
    const msg = data?.message || 'Failed to remove profile image';
    throw new Error(msg);
  }
  return data;
}

export async function sendInitialChatMessage(recipientId: string, message: string, serviceName?: string) {
  const token = localStorage.getItem('sehatkor_token');
  const res = await apiFetch(apiUrl('/api/chat/initial-message'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ 
      recipientId, 
      message,
      serviceName 
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to send initial message');
  }
  return res.json();
}
