import { PlayerRole } from "../types/game";

/**
 * Determines player role based on whether they created the room
 * @param isRoomCreator - Whether the player created the room
 * @returns "X" if creator, "O" if joiner
 */
export function assignRoleByCreatorStatus(
  isRoomCreator: boolean
): PlayerRole {
  return isRoomCreator ? "X" : "O";
}

/**
 * Determines player role based on member order (fallback method)
 * @param memberIds - Array of member user IDs
 * @param myUserId - Current user's ID
 * @returns "X" for first member, "O" for second member
 */
export function assignRoleByMemberOrder(
  memberIds: string[],
  myUserId: string | null
): PlayerRole | null {
  if (!myUserId || memberIds.length < 2) return null;
  
  const sortedIds = memberIds.sort();
  const myIndex = sortedIds.indexOf(myUserId);
  
  if (myIndex === -1) return null;
  return myIndex === 0 ? "X" : "O";
}
