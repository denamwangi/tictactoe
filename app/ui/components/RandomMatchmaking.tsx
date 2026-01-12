"use client";
import { useMatchmaking } from "../../hooks/useMatchmaking";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RandomMatchmaking() {
  const {
    isWaiting,
    waitingCount,
    isConnected,
    startMatchmaking,
    stopMatchmaking,
  } = useMatchmaking();
  const router = useRouter();

  useEffect(() => {
    startMatchmaking();
    return () => {
      stopMatchmaking();
    };
  }, [startMatchmaking, stopMatchmaking]);

  const handleCancel = () => {
    stopMatchmaking();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Finding Opponent...
        </h2>
        <p className="text-gray-600">
          {isConnected
            ? `Waiting for match... (${waitingCount} player${
                waitingCount !== 1 ? "s" : ""
              } in queue)`
            : "Connecting to matchmaking..."}
        </p>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Searching for opponent</span>
      </div>

      <button
        onClick={handleCancel}
        className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 active:scale-95 transition-all"
      >
        Cancel
      </button>
    </div>
  );
}
