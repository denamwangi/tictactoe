import { getRoomUrl } from "../../utils/room";
import toast from "react-hot-toast";

interface WaitingRoomProps {
  roomId: string;
}

export default function WaitingRoom({ roomId }: WaitingRoomProps) {
  const roomUrl = getRoomUrl(roomId);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    toast.success("Room link copied!");
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 bg-white rounded-lg border-2 border-gray-200 max-w-md w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Waiting for Opponent
        </h2>
        <p className="text-gray-600">
          Share this room code with your friend
        </p>
      </div>

      <div className="text-center">
        <div className="text-5xl font-mono font-bold text-blue-600 mb-4 tracking-wider">
          {roomId}
        </div>
      </div>

      <div className="w-full">
        <button
          onClick={handleCopyLink}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          Copy Room Link
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Or share this link:</p>
        <p className="font-mono text-xs break-all mt-1">{roomUrl}</p>
      </div>

      <div className="flex items-center gap-2 text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm">Waiting...</span>
      </div>
    </div>
  );
}
