import Pusher from "pusher";

// Validate environment variables
const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!appId) {
  throw new Error(
    "PUSHER_APP_ID is not set. Please add it to your environment variables."
  );
}

if (!key) {
  throw new Error(
    "NEXT_PUBLIC_PUSHER_KEY is not set. Please add it to your environment variables."
  );
}

if (!secret) {
  throw new Error(
    "PUSHER_SECRET is not set. Please add it to your environment variables."
  );
}

if (!cluster) {
  throw new Error(
    "NEXT_PUBLIC_PUSHER_CLUSTER is not set. Please add it to your environment variables."
  );
}

// Server-side Pusher instance (for future server-side operations)
export const pusherServer = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});
