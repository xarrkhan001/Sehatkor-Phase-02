const userIdToSockets = new Map();

export function registerUserSocket(userId, socketId) {
  if (!userIdToSockets.has(userId)) {
    userIdToSockets.set(userId, new Set());
  }
  userIdToSockets.get(userId).add(socketId);
}

export function unregisterUserSocket(userId, socketId) {
  const set = userIdToSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) userIdToSockets.delete(userId);
}

export function getUserSocketIds(userId) {
  return Array.from(userIdToSockets.get(userId) || []);
}

export function getOnlineUserIds() {
  return Array.from(userIdToSockets.keys());
}




