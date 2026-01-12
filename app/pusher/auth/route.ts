import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "../../lib/pusher-server";

export async function POST(request: NextRequest) {
  try {
    let socket_id: string;
    let channel_name: string;

    // Pusher sends URL-encoded data as a string in the body
    const body = await request.text();
    
    // Parse URL-encoded string manually
    const params = new URLSearchParams(body);
    socket_id = params.get("socket_id") || "";
    channel_name = params.get("channel_name") || "";

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    // For presence channels, we need to provide user info
    // Use socket_id as a stable identifier (or generate from a cookie/session)
    // For now, we'll use a hash of socket_id to ensure consistency
    const userId = `user_${socket_id.substring(0, 8)}`;
    
    const presenceData = {
      user_id: userId,
      user_info: {
        name: "Player",
      },
    };

    // Use authorizeChannel for presence channels
    const auth = pusherServer.authorizeChannel(
      socket_id,
      channel_name,
      presenceData
    );

    return NextResponse.json(auth);
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
