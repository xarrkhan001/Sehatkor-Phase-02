export async function fetchVerifiedUsers() {
  const token = localStorage.getItem('sehatkor_token');
  const res = await fetch('http://localhost:4000/api/chat/users/verified', {
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
  const res = await fetch('http://localhost:4000/api/chat/conversations', {
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
  const res = await fetch(`http://localhost:4000/api/chat/messages/${conversationId}`, {
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
  const res = await fetch(`http://localhost:4000/api/chat/messages/${messageId}?scope=${scope}`, {
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
  const res = await fetch('http://localhost:4000/api/upload', {
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
  const res = await fetch('http://localhost:4000/api/profile/upload-image', {
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
  const res = await fetch('http://localhost:4000/api/chat/conversations', {
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
  const res = await fetch('http://localhost:4000/api/chat/conversations/read', {
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
  const res = await fetch(`http://localhost:4000/api/chat/conversations/${conversationId}/messages`, {
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
  const res = await fetch('http://localhost:4000/api/profile', {
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
  const res = await fetch('http://localhost:4000/api/profile', {
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


