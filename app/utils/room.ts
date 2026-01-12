/**
 * Generates a unique room ID
 * Format: 6-character alphanumeric string (uppercase)
 */
export function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Constructs a Pusher presence channel name from a room ID
 * Note: Presence channels must start with "presence-"
 */
export function getChannelName(roomId: string): string {
  return `presence-room-${roomId}`;
}

/**
 * Creates a shareable room URL
 */
export function getRoomUrl(roomId: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}/game/${roomId}`;
}

/**
 * Extracts room ID from URL path
 */
export function getRoomIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/game\/([A-Z0-9]{6})$/);
  return match ? match[1] : null;
}

/**
 * Validates room ID format
 */
export function isValidRoomId(roomId: string): boolean {
  return /^[A-Z0-9]{6}$/.test(roomId);
}
