/**
 * Matchmaking channel name for random opponent matching
 */
export const MATCHMAKING_CHANNEL = "presence-matchmaking";

/**
 * Determines if a user should be the room creator based on deterministic leader election
 * Uses sorted user IDs - earliest (alphabetically first) creates the room
 */
export function shouldCreateRoom(
  myUserId: string | null,
  allUserIds: string[]
): boolean {
  if (!myUserId || allUserIds.length < 2) return false;
  const sortedIds = [...allUserIds].sort();
  return sortedIds[0] === myUserId;
}

/**
 * Gets the user ID from Pusher presence members
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMyUserId(members: any): string | null {
  if (!members) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (members.me as any)?.id || null;
}

/**
 * Gets all user IDs from Pusher presence members
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAllUserIds(members: any): string[] {
  if (!members || !members.members) return [];
  return Object.keys(members.members);
}
