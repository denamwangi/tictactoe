import Pusher from "pusher-js";

// Client-side Pusher instance
// Only uses public credentials (key and cluster)
// Presence channels require authentication endpoint
export const pusherClient = new Pusher(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/pusher/auth",
    // Don't set Content-Type - Pusher handles it automatically
  }
);
