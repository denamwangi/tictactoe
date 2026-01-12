"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomId, isValidRoomId } from "../utils/room";
import { setUserMode, setUserStatus } from "../utils/userState";
import toast from "react-hot-toast";

export default function FriendPlayPage() {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = () => {
    setIsCreating(true);
    setUserMode("friend");
    setUserStatus("browsing");
    const roomId = generateRoomId();
    router.push(`/game/${roomId}`);
  };

  const handleJoinGame = () => {
    const trimmed = joinRoomId.trim().toUpperCase();
    if (!isValidRoomId(trimmed)) {
      toast.error("Invalid room code. Must be 6 characters (A-Z, 0-9)");
      return;
    }
    setUserMode("friend");
    setUserStatus("browsing");
    router.push(`/game/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Play with Friend</h1>
        <p className="text-gray-600">Create a room or join with a code</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        {/* Create Game Button */}
        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "Create New Game"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Join Game Section */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleJoinGame();
              }
            }}
            placeholder="Enter room code"
            maxLength={6}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-lg font-mono uppercase focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleJoinGame}
            disabled={!joinRoomId.trim()}
            className="px-8 py-4 bg-green-600 text-white font-semibold text-lg rounded-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game
          </button>
        </div>

        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
