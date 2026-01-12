import { useState, useEffect, useRef, useCallback } from "react";
import { pusherClient } from "../lib/pusher-client";
import { generateRoomId } from "../utils/room";
import type { PresenceChannel } from "pusher-js";
import {
  MATCHMAKING_CHANNEL,
  shouldCreateRoom,
  getMyUserId,
  getAllUserIds,
} from "../utils/matchmaking";
import {
  setUserStatus,
  setStoredRoomId,
  setUserMode,
} from "../utils/userState";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function useMatchmaking() {
  const router = useRouter();
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const matchFoundRef = useRef(false);
  const roomCreatedRef = useRef(false);
  const channelRef = useRef<PresenceChannel | null>(null);

  // Subscribe to matchmaking channel when waiting
  useEffect(() => {
    if (!isWaiting) {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const newChannel = pusherClient.subscribe(
      MATCHMAKING_CHANNEL
    ) as PresenceChannel;
    channelRef.current = newChannel;

    const handleSubscriptionSucceeded = (members: any) => {
      setIsConnected(true);
      const count = members?.count || 0;
      setWaitingCount(count);

      if (count >= 2) {
        const myUserId = getMyUserId(members);
        const allUserIds = getAllUserIds(members);

        if (
          shouldCreateRoom(myUserId, allUserIds) &&
          !roomCreatedRef.current
        ) {
          roomCreatedRef.current = true;
          createMatch(members, newChannel);
        }
      }
    };

    const handleMemberAdded = (member: any) => {
      const count = newChannel.members?.count || 0;
      setWaitingCount(count);

      if (count >= 2 && !matchFoundRef.current) {
        const members = newChannel.members;
        const myUserId = getMyUserId(members);
        const allUserIds = getAllUserIds(members);

        if (
          shouldCreateRoom(myUserId, allUserIds) &&
          !roomCreatedRef.current
        ) {
          roomCreatedRef.current = true;
          createMatch(members, newChannel);
        }
      }
    };

    const handleMemberRemoved = (member: any) => {
      const count = newChannel.members?.count || 0;
      setWaitingCount(count);

      if (matchFoundRef.current && count < 2) {
        handleMatchCancelled();
      }
    };

    newChannel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    newChannel.bind("pusher:member_added", handleMemberAdded);
    newChannel.bind("pusher:member_removed", handleMemberRemoved);

    return () => {
      newChannel.unbind(
        "pusher:subscription_succeeded",
        handleSubscriptionSucceeded
      );
      newChannel.unbind("pusher:member_added", handleMemberAdded);
      newChannel.unbind("pusher:member_removed", handleMemberRemoved);
      newChannel.unbind_all();
      newChannel.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [isWaiting]);

  const createMatch = useCallback(
    (members: any, channel: PresenceChannel) => {
      if (matchFoundRef.current) return;

      const myUserId = getMyUserId(members);
      const allUserIds = getAllUserIds(members);

      if (allUserIds.length < 2) return;

      // Create room
      const roomId = generateRoomId();

      // Determine roles: creator (first alphabetically) = X, joiner = O
      const sortedIds = [...allUserIds].sort();
      const myIndex = sortedIds.indexOf(myUserId || "");
      const playerRole = myIndex === 0 ? "X" : "O";

      // Emit match-found event
      channel.trigger("client-match-found", {
        roomId,
        creatorId: sortedIds[0],
        joinerId: sortedIds[1],
      });

      matchFoundRef.current = true;
      setUserStatus("matched");
      setStoredRoomId(roomId);

      // Navigate to game room
      router.push(`/game/${roomId}`);
    },
    [router]
  );

  const handleMatchCancelled = useCallback(() => {
    matchFoundRef.current = false;
    roomCreatedRef.current = false;
    setUserStatus("waiting");
    setStoredRoomId(null);
    toast.error("Match cancelled - opponent disconnected");
  }, []);

  // Listen for match-found event (for the joiner)
  useEffect(() => {
    if (!channelRef.current || !isConnected) return;

    const channel = channelRef.current;

    const handleMatchFound = (data: {
      roomId: string;
      creatorId: string;
      joinerId: string;
    }) => {
      if (matchFoundRef.current) return; // Already handled

      const myUserId = getMyUserId(channel.members);
      const allUserIds = getAllUserIds(channel.members);

      // Verify we're part of this match
      if (!myUserId || !allUserIds.includes(myUserId)) return;

      matchFoundRef.current = true;
      setUserStatus("matched");
      setStoredRoomId(data.roomId);

      // Navigate to game room
      router.push(`/game/${data.roomId}`);
    };

    const handleMatchCancelledEvent = () => {
      handleMatchCancelled();
    };

    channel.bind("client-match-found", handleMatchFound);
    channel.bind("client-match-cancelled", handleMatchCancelledEvent);

    return () => {
      channel.unbind("client-match-found", handleMatchFound);
      channel.unbind("client-match-cancelled", handleMatchCancelledEvent);
    };
  }, [isConnected, router, handleMatchCancelled]);

  const startMatchmaking = useCallback(() => {
    setIsWaiting(true);
    setUserStatus("waiting");
    setUserMode("random");
    matchFoundRef.current = false;
    roomCreatedRef.current = false;
  }, []);

  const stopMatchmaking = useCallback(() => {
    setIsWaiting(false);
    setUserStatus("browsing");
    setStoredRoomId(null);
    matchFoundRef.current = false;
    roomCreatedRef.current = false;
  }, []);

  return {
    isWaiting,
    waitingCount,
    isConnected,
    startMatchmaking,
    stopMatchmaking,
  };
}
