import { PlayerRole } from "../../types/game";
import { getRoomUrl } from "../../utils/room";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface RoomInfoProps {
  roomId: string;
  playerRole: PlayerRole;
  opponentConnected: boolean;
  onLeave: () => void;
}

export default function RoomInfo({
  roomId,
  playerRole,
  opponentConnected,
  onLeave,
}: RoomInfoProps) {
  const router = useRouter();
  const roomUrl = getRoomUrl(roomId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success("Room link copied!");
  };

  const handleLeave = () => {
    onLeave();
    router.push("/");
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg border-2 border-gray-200 p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-sm text-gray-600">Room Code</div>
            <div className="text-xl font-mono font-bold text-blue-600">
              {roomId}
            </div>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <div className="text-sm text-gray-600">You are</div>
            <div
              className={`text-xl font-bold ${
                playerRole === "X" ? "text-blue-600" : "text-red-600"
              }`}
            >
              Player {playerRole}
            </div>
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <div className="text-sm text-gray-600">Opponent</div>
            <div
              className={`text-sm font-semibold ${
                opponentConnected ? "text-green-600" : "text-gray-400"
              }`}
            >
              {opponentConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 active:scale-95 transition-all text-sm"
          >
            Copy Link
          </button>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 active:scale-95 transition-all text-sm"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
