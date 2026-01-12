import { useEffect, useState, useRef } from "react";
import { pusherClient } from "../lib/pusher-client";
import { getChannelName } from "../utils/room";
import type { Channel, PresenceChannel } from "pusher-js";

interface UsePusherChannelOptions {
  roomId: string | null;
  onMemberAdded?: (member: any) => void;
  onMemberRemoved?: (member: any) => void;
  onSubscriptionSucceeded?: (members: any) => void;
  onEvent?: (eventName: string, data: any) => void;
}

export function usePusherChannel({
  roomId,
  onMemberAdded,
  onMemberRemoved,
  onSubscriptionSucceeded,
  onEvent,
}: UsePusherChannelOptions) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!roomId) {
      // Clean up if no room ID
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setChannel(null);
        setIsConnected(false);
      }
      return;
    }

    // Don't re-subscribe if already subscribed to this channel
    const channelName = getChannelName(roomId);
    if (channelRef.current && channelRef.current.name === channelName) {
      return;
    }

    // Clean up previous channel if switching rooms
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current.unsubscribe();
    }

    const newChannel = pusherClient.subscribe(channelName) as PresenceChannel;
    channelRef.current = newChannel;

    // Wait for subscription to succeed
    const handleSubscriptionSucceeded = (members: any) => {
      setIsConnected(true);
      setChannel(newChannel);
      onSubscriptionSucceeded?.(members);
    };

    // Handle member events (presence channel)
    const handleMemberAdded = (member: any) => {
      onMemberAdded?.(member);
    };

    const handleMemberRemoved = (member: any) => {
      onMemberRemoved?.(member);
    };

    newChannel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    newChannel.bind("pusher:member_added", handleMemberAdded);
    newChannel.bind("pusher:member_removed", handleMemberRemoved);

    // Cleanup
    return () => {
      if (channelRef.current === newChannel) {
        newChannel.unbind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
        newChannel.unbind("pusher:member_added", handleMemberAdded);
        newChannel.unbind("pusher:member_removed", handleMemberRemoved);
        newChannel.unbind_all();
        newChannel.unsubscribe();
        channelRef.current = null;
        setChannel(null);
        setIsConnected(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // Only depend on roomId to prevent re-subscriptions

  // Helper to get member count (for presence channels)
  const getMemberCount = (): number => {
    if (channel && "members" in channel) {
      return (channel as PresenceChannel).members.count;
    }
    return 0;
  };

  // Helper to bind to specific events
  const bindEvent = (eventName: string, callback: (data: any) => void) => {
    if (channel) {
      channel.bind(eventName, callback);
      return () => {
        channel?.unbind(eventName, callback);
      };
    }
  };

  // Helper to trigger events
  const trigger = (eventName: string, data: any) => {
    if (channel && isConnected) {
      channel.trigger("client-" + eventName, data);
    }
  };

  return {
    channel,
    isConnected,
    bindEvent,
    trigger,
    getMemberCount,
  };
}
