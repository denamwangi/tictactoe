import { useState, useEffect, useCallback, useRef } from "react";
import { Board, Player, PlayerRole, RoomStatus, MultiplayerGameState } from "../types/game";
import { getGameStatus } from "../utils/gameLogic";
import { usePusherChannel } from "./usePusherChannel";
import toast from "react-hot-toast";

const createEmptyBoard = (): Board => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

const STORAGE_KEY_PREFIX = "tictactoe_player_";

/**
 * Gets stored player role for a room
 */
function getStoredPlayerRole(roomId: string): PlayerRole {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${roomId}`);
  return (stored === "X" || stored === "O" ? stored : null) as PlayerRole;
}

/**
 * Stores player role for a room
 */
function storePlayerRole(roomId: string, role: PlayerRole): void {
  if (typeof window === "undefined") return;
  if (role) {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${roomId}`, role);
  } else {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${roomId}`);
  }
}

/**
 * Randomly assigns X or O
 */
function assignRandomRole(): PlayerRole {
  return Math.random() < 0.5 ? "X" : "O";
}

export function useMultiplayerGame(roomId: string | null) {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [playerRole, setPlayerRole] = useState<PlayerRole>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("waiting");
  const [playerCount, setPlayerCount] = useState(0);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(null);
  const hasJoinedRef = useRef(false);

  const gameStatus = getGameStatus(board);

  // Initialize player role from storage if available
  useEffect(() => {
    if (roomId && !playerRole) {
      const stored = getStoredPlayerRole(roomId);
      if (stored) {
        setPlayerRole(stored);
      }
    }
  }, [roomId, playerRole]);

  // Pusher channel setup
  const { channel, isConnected, bindEvent, trigger } = usePusherChannel({
    roomId,
    onSubscriptionSucceeded: (members: any) => {
      // members.count is available in presence channels
      const count = members?.count || 0;
      setPlayerCount(count);
      if (count === 2) {
        setOpponentConnected(true);
      }
    },
    onMemberAdded: (member: any) => {
      // Use the channel reference to get current count
      const count = channel && "members" in channel ? (channel as any).members.count : 0;
      setPlayerCount(count);
      
      if (count === 2 && !hasJoinedRef.current) {
        hasJoinedRef.current = true;
        // Both players present - assign roles if not already assigned
        if (!playerRole) {
          const newRole = assignRandomRole();
          setPlayerRole(newRole);
          if (roomId) {
            storePlayerRole(roomId, newRole);
          }
          // Announce role assignment
          trigger("player-role", { role: newRole });
        }
        setRoomStatus("ready");
        // Randomly decide who starts
        const startingPlayer: Player = Math.random() < 0.5 ? "X" : "O";
        setCurrentPlayer(startingPlayer);
        trigger("game-start", { startingPlayer });
        toast.success("Game starting!");
      } else if (count === 2) {
        setOpponentConnected(true);
        setRoomStatus("ready");
        toast.success("Opponent joined!");
      }
    },
    onMemberRemoved: (member: any) => {
      // Use the channel reference to get current count
      const count = channel && "members" in channel ? (channel as any).members.count : 0;
      setPlayerCount(count);
      if (count < 2) {
        setOpponentConnected(false);
        if (roomStatus === "playing" || roomStatus === "ready") {
          setRoomStatus("waiting");
          toast.error("Opponent disconnected");
        }
      }
    },
  });

  // Listen for game start event
  useEffect(() => {
    if (!channel || !isConnected) return;

    const unbindStart = bindEvent("client-game-start", (data: { startingPlayer: Player }) => {
      if (data.startingPlayer) {
        setCurrentPlayer(data.startingPlayer);
        setRoomStatus("playing");
      }
    });

    const unbindMove = bindEvent("client-move", (data: { row: number; col: number; player: Player }) => {
      // Apply opponent's move
      if (data.player !== playerRole) {
        setBoard((prev) => {
          const newBoard: Board = prev.map((r, rIdx) =>
            r.map((cell, cIdx) =>
              rIdx === data.row && cIdx === data.col ? data.player : cell
            )
          );
          const newStatus = getGameStatus(newBoard);
          if (newStatus.status === "won" || newStatus.status === "draw") {
            setRoomStatus("finished");
          }
          return newBoard;
        });
        // Switch turn to current player
        setCurrentPlayer(playerRole);
      }
    });

    const unbindReset = bindEvent("client-reset", () => {
      setBoard(createEmptyBoard());
      const startingPlayer: Player = Math.random() < 0.5 ? "X" : "O";
      setCurrentPlayer(startingPlayer);
      setRoomStatus("playing");
      trigger("game-start", { startingPlayer });
    });

    return () => {
      unbindStart?.();
      unbindMove?.();
      unbindReset?.();
    };
  }, [channel, isConnected, playerRole, bindEvent, trigger, roomStatus]);

  // Join room when connected
  useEffect(() => {
    if (isConnected && channel && !hasJoinedRef.current) {
      const count = channel && "members" in channel ? (channel as any).members.count : 0;
      if (count === 2 && !playerRole) {
        // Wait for role assignment from first player or assign randomly
        const newRole = assignRandomRole();
        setPlayerRole(newRole);
        if (roomId) {
          storePlayerRole(roomId, newRole);
        }
        trigger("player-role", { role: newRole });
      }
    }
  }, [isConnected, channel, playerRole, roomId, trigger]);

  const makeMove = useCallback(
    (row: number, col: number) => {
      // Validation
      if (roomStatus !== "playing" && roomStatus !== "ready") {
        toast.error("Game not ready");
        return false;
      }

      if (!playerRole) {
        toast.error("Player role not assigned");
        return false;
      }

      if (currentPlayer !== playerRole) {
        toast.error("Not your turn");
        return false;
      }

      if (board[row][col] !== null) {
        toast.error("Cell already taken");
        return false;
      }

      // Make the move
      const newBoard: Board = board.map((r, rIdx) =>
        r.map((cell, cIdx) => (rIdx === row && cIdx === col ? playerRole : cell))
      );

      setBoard(newBoard);
      setRoomStatus("playing");

      // Broadcast move
      trigger("move", { row, col, player: playerRole });

      // Check game status
      const newGameStatus = getGameStatus(newBoard);
      if (newGameStatus.status === "won" || newGameStatus.status === "draw") {
        setRoomStatus("finished");
        setCurrentPlayer(null);
      } else {
        // Switch turn
        setCurrentPlayer(playerRole === "X" ? "O" : "X");
      }

      return true;
    },
    [board, playerRole, currentPlayer, roomStatus, trigger]
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    const startingPlayer: Player = Math.random() < 0.5 ? "X" : "O";
    setCurrentPlayer(startingPlayer);
    setRoomStatus("playing");
    trigger("reset", {});
  }, [trigger]);

  const gameState: MultiplayerGameState = {
    board,
    currentPlayer,
    status: gameStatus.status,
    winner: gameStatus.winner,
    winningCells: gameStatus.winningCells,
    playerRole,
    roomStatus,
    playerCount,
    opponentConnected,
    roomId: roomId || "",
  };

  return {
    gameState,
    makeMove,
    resetGame,
    isConnected,
  };
}
