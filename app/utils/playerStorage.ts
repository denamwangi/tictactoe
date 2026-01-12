import { PlayerRole } from "../types/game";

const STORAGE_KEY_PREFIX = "tictactoe_player_";

/**
 * Gets stored player role for a room from localStorage
 */
export function getStoredPlayerRole(roomId: string): PlayerRole {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomId}`);
  return (stored === "X" || stored === "O" ? stored : null) as PlayerRole;
}

/**
 * Stores player role for a room in localStorage
 */
export function storePlayerRole(roomId: string, role: PlayerRole): void {
  if (typeof window === "undefined") return;
  if (role) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, role);
  } else {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${roomId}`);
  }
}

/**
 * Clears stored player role for a room
 */
export function clearStoredPlayerRole(roomId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${roomId}`);
}
