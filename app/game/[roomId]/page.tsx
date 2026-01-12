"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMultiplayerGame } from "../../hooks/useMultiplayerGame";
import { isValidRoomId } from "../../utils/room";
import { setUserStatus, setStoredRoomId, getUserMode } from "../../utils/userState";
import Grid from "../../ui/components/Grid";
import WaitingRoom from "../../ui/components/WaitingRoom";
import RoomInfo from "../../ui/components/RoomInfo";
import toast from "react-hot-toast";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  // Validate room ID and set user state
  useEffect(() => {
    if (!roomId || !isValidRoomId(roomId)) {
      toast.error("Invalid room code");
      router.push("/");
      return;
    }
    
    // Update user state when entering game room
    setUserStatus("in_game");
    setStoredRoomId(roomId);
  }, [roomId, router]);

  const { gameState, makeMove, resetGame, isConnected } = useMultiplayerGame(
    roomId && isValidRoomId(roomId) ? roomId : null
  );

  // Handle match cancellation - redirect to appropriate page
  useEffect(() => {
    const handleMatchCancelled = () => {
      const userMode = getUserMode();
      if (userMode === "random") {
        router.push("/random");
      } else {
        router.push("/");
      }
    };

    // This will be triggered by the hook's match-cancelled event
    // We'll listen for navigation needs
  }, [router]);

  if (!roomId || !isValidRoomId(roomId)) {
    return null;
  }

  const getStatusMessage = () => {
    if (gameState.roomStatus === "waiting") {
      return "Waiting for opponent...";
    }
    if (gameState.roomStatus === "ready" && gameState.currentPlayer) {
      return `Game starting! ${gameState.currentPlayer} goes first.`;
    }
    if (gameState.status === "won") {
      if (gameState.winner === gameState.playerRole) {
        return "You win! 🎉";
      }
      return "You lost 😢";
    }
    if (gameState.status === "draw") {
      return "It's a draw!";
    }
    if (gameState.currentPlayer === gameState.playerRole) {
      return "Your turn";
    }
    return "Opponent's turn";
  };

  const isYourTurn =
    gameState.roomStatus === "playing" &&
    gameState.currentPlayer === gameState.playerRole;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-4">
      {!isConnected && (
        <div className="text-center text-gray-500">Connecting...</div>
      )}

      {isConnected && (
        <>
          {/* Room Info */}
          <RoomInfo
            roomId={roomId}
            playerRole={gameState.playerRole}
            opponentConnected={gameState.opponentConnected}
            onLeave={() => {
              // Cleanup handled by hook
            }}
          />

          {/* Waiting Room */}
          {gameState.roomStatus === "waiting" && (
            <WaitingRoom roomId={roomId} />
          )}

          {/* Game Board */}
          {(gameState.roomStatus === "ready" ||
            gameState.roomStatus === "playing" ||
            gameState.roomStatus === "finished") && (
            <>
              {/* Status Display */}
              <div className="text-2xl font-bold text-gray-800">
                {getStatusMessage()}
              </div>

              {/* Game Grid */}
              <Grid
                board={gameState.board}
                winningCells={gameState.winningCells}
                gameStatus={gameState.status}
                onCellClick={makeMove}
                isYourTurn={isYourTurn}
                disabled={!isYourTurn || gameState.status !== "playing"}
              />

              {/* Reset Button (only show when game is finished) */}
              {gameState.roomStatus === "finished" && (
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  New Game
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
