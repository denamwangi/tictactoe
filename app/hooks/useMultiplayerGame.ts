import { useState, useEffect, useCallback, useRef } from "react";
import {
  Board,
  Player,
  PlayerRole,
  RoomStatus,
  MultiplayerGameState,
} from "../types/game";
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
  const gameStartedRef = useRef(false);
  const roleAssignedRef = useRef(false);
  const isRoomCreatorRef = useRef<boolean | null>(null); // Track if we created the room
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const triggerRef = useRef<((event: string, data: any) => void) | null>(null);

  const gameStatus = getGameStatus(board);

  // Initialize player role from storage if available
  useEffect(() => {
    if (roomId && !playerRole) {
      const stored = getStoredPlayerRole(roomId);
      if (stored) {
        // Initialize from localStorage - this is intentional initialization
        setPlayerRole(stored);
        roleAssignedRef.current = true;
      }
    }
  }, [roomId, playerRole]);

  // Initialize game when both players are present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initializeGame = useCallback(
    (members: any, channelRef?: any, triggerFn?: any) => {
      if (!roomId) return;

      // Check if we already have a role from storage
      if (playerRole && roleAssignedRef.current) {
        // We have a role, just start the game
        setRoomStatus("ready");
        // Creator (X) always goes first
        const startingPlayer: Player = "X";
        setCurrentPlayer(startingPlayer);
        if (triggerFn) {
          triggerFn("game-start", { startingPlayer });
        }
        toast.success("Game starting!");
        return;
      }

      // Assign roles: room creator (first player) gets X, second player gets O
      let newRole: PlayerRole;
      if (isRoomCreatorRef.current === true) {
        // We created the room, we're X
        newRole = "X";
      } else if (isRoomCreatorRef.current === false) {
        // We joined the room, we're O
        newRole = "O";
      } else {
        // Fallback: if we can't determine, use member order
        const memberIds = Object.keys(members?.members || {});
        if (memberIds.length < 2) return; // Need 2 players

        const sortedIds = memberIds.sort();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const myUserId =
          (members?.me as any)?.id ||
          (channelRef && "members" in channelRef
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (channelRef as any).members.me?.id
            : null);

        if (myUserId) {
          const myIndex = sortedIds.indexOf(myUserId);
          newRole = myIndex === 0 ? "X" : "O";
          // Update creator ref based on role
          isRoomCreatorRef.current = myIndex === 0;
        } else {
          // Last resort: assign randomly
          newRole = assignRandomRole();
        }
      }

      if (!playerRole && !roleAssignedRef.current) {
        setPlayerRole(newRole);
        storePlayerRole(roomId, newRole);
        roleAssignedRef.current = true;
        if (triggerFn) {
          triggerFn("player-role", { role: newRole });
        }
      }

      setRoomStatus("ready");

      // Creator (X) always goes first
      const startingPlayer: Player = "X";
      setCurrentPlayer(startingPlayer);
      // Set to playing immediately for the player who triggers (they don't always receive their own client event)
      setRoomStatus("playing");
      if (triggerFn) {
        triggerFn("game-start", { startingPlayer });
      }
      toast.success("Game starting!");
    },
    [roomId, playerRole]
  );

  // Pusher channel setup
  const { channel, isConnected, bindEvent, trigger } = usePusherChannel({
    roomId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSubscriptionSucceeded: (members: any) => {
      // members.count is available in presence channels
      const count = members?.count || 0;
      setPlayerCount(count);

      // Determine if we're the room creator (first player)
      if (isRoomCreatorRef.current === null) {
        isRoomCreatorRef.current = count === 1; // If count is 1, we're the creator
      }

      if (count === 2) {
        setOpponentConnected(true);
        // If both players are already present when we subscribe, start the game
        if (!gameStartedRef.current) {
          gameStartedRef.current = true;
          triggerRef.current = trigger;
          setTimeout(() => initializeGame(members, channel, trigger), 0);
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMemberAdded: (member: any, channelRef: any) => {
      // Get accurate count from the channel passed to callback
      const count = channelRef?.members?.count || 0;
      setPlayerCount(count);

      // Determine if we're the room creator (first player) if not already set
      if (isRoomCreatorRef.current === null) {
        // If we see count go from 1 to 2, we were the first (creator)
        // If we see count === 2 when we first join, we're the second (joiner)
        isRoomCreatorRef.current = playerCount === 1 && count === 2;
      }

      if (count === 2) {
        setOpponentConnected(true);

        // Only the first player to see count === 2 should initialize the game
        if (!gameStartedRef.current) {
          gameStartedRef.current = true;
          triggerRef.current = trigger;
          setTimeout(
            () => initializeGame(channelRef.members, channelRef, trigger),
            0
          );
        } else {
          // Second player just needs to wait for game-start event
          setRoomStatus("ready");
          toast.success("Opponent joined!");
        }
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMemberRemoved: (member: any, channel: any) => {
      // Get accurate count from the channel passed to callback
      const count = channel?.members?.count || 0;
      setPlayerCount(count);
      if (count < 2) {
        setOpponentConnected(false);
        gameStartedRef.current = false;
        roleAssignedRef.current = false;
        isRoomCreatorRef.current = null; // Reset creator status
        if (roomStatus === "playing" || roomStatus === "ready") {
          setRoomStatus("waiting");
          toast.error("Opponent disconnected");
        }
      }
    },
  });

  // Update trigger ref when trigger changes
  useEffect(() => {
    triggerRef.current = trigger;
  }, [trigger]);

  // Listen for game start event
  useEffect(() => {
    if (!channel || !isConnected) return;

    const unbindStart = bindEvent(
      "client-game-start",
      (data: { startingPlayer: Player }) => {
        if (data.startingPlayer) {
          setCurrentPlayer(data.startingPlayer);
          setRoomStatus("playing");
        }
      }
    );

    const unbindMove = bindEvent(
      "client-move",
      (data: { row: number; col: number; player: Player }) => {
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
      }
    );

    const unbindReset = bindEvent("client-reset", () => {
      setBoard(createEmptyBoard());
      // Creator (X) always goes first
      const startingPlayer: Player = "X";
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

  // Handle role assignment from other player
  useEffect(() => {
    if (!channel || !isConnected) return;

    const unbindRole = bindEvent(
      "client-player-role",
      (data: { role: PlayerRole }) => {
        if (!playerRole && data.role) {
          // Only accept role if we don't have one yet
          setPlayerRole(data.role);
          if (roomId) {
            storePlayerRole(roomId, data.role);
          }
          roleAssignedRef.current = true;
        }
      }
    );

    return () => {
      unbindRole?.();
    };
  }, [channel, isConnected, playerRole, roomId, bindEvent]);

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
        r.map((cell, cIdx) =>
          rIdx === row && cIdx === col ? playerRole : cell
        )
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
    // Creator (X) always goes first
    const startingPlayer: Player = "X";
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
