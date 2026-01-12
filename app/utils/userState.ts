export type UserMode = "friend" | "random";
export type UserStatus = "browsing" | "waiting" | "matched" | "in_game" | "disconnected";

const STORAGE_KEY_MODE = "tictactoe_user_mode";
const STORAGE_KEY_STATUS = "tictactoe_user_status";
const STORAGE_KEY_ROOM_ID = "tictactoe_room_id";

/**
 * Gets the stored user mode from localStorage
 */
export function getUserMode(): UserMode | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_MODE);
  return stored === "friend" || stored === "random" ? stored : null;
}

/**
 * Stores the user mode in localStorage
 */
export function setUserMode(mode: UserMode | null): void {
  if (typeof window === "undefined") return;
  if (mode) {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  } else {
    localStorage.removeItem(STORAGE_KEY_MODE);
  }
}

/**
 * Gets the stored user status from localStorage
 */
export function getUserStatus(): UserStatus | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_STATUS);
  const validStatuses: UserStatus[] = [
    "browsing",
    "waiting",
    "matched",
    "in_game",
    "disconnected",
  ];
  return validStatuses.includes(stored as UserStatus)
    ? (stored as UserStatus)
    : null;
}

/**
 * Stores the user status in localStorage
 */
export function setUserStatus(status: UserStatus | null): void {
  if (typeof window === "undefined") return;
  if (status) {
    localStorage.setItem(STORAGE_KEY_STATUS, status);
  } else {
    localStorage.removeItem(STORAGE_KEY_STATUS);
  }
}

/**
 * Gets the stored room ID from localStorage
 */
export function getStoredRoomId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_ROOM_ID);
}

/**
 * Stores the room ID in localStorage
 */
export function setStoredRoomId(roomId: string | null): void {
  if (typeof window === "undefined") return;
  if (roomId) {
    localStorage.setItem(STORAGE_KEY_ROOM_ID, roomId);
  } else {
    localStorage.removeItem(STORAGE_KEY_ROOM_ID);
  }
}

/**
 * Clears all user state from localStorage
 */
export function clearUserState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_MODE);
  localStorage.removeItem(STORAGE_KEY_STATUS);
  localStorage.removeItem(STORAGE_KEY_ROOM_ID);
}
