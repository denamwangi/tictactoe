import Pusher from "pusher-js";

// Validate environment variables
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!pusherKey) {
  throw new Error(
    "NEXT_PUBLIC_PUSHER_KEY is not set. Please add it to your environment variables."
  );
}

if (!pusherCluster) {
  throw new Error(
    "NEXT_PUBLIC_PUSHER_CLUSTER is not set. Please add it to your environment variables."
  );
}

// Client-side Pusher instance
// Only uses public credentials (key and cluster)
// Presence channels require authentication endpoint
export const pusherClient = new Pusher(pusherKey, {
  cluster: pusherCluster,
  authEndpoint: "/pusher/auth",
  // Don't set Content-Type - Pusher handles it automatically
});
