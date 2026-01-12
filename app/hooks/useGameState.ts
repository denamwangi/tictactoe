import { useState, useCallback } from "react";
import { Board, Player, GameState, GameScores } from "../types/game";
import {
  getGameStatus,
  createEmptyBoard,
  applyMoveToBoard,
} from "../utils/gameLogic";

/**
 * Randomly selects who starts first (X or O)
 */
function getRandomStartingPlayer(): Player {
  return Math.random() < 0.5 ? "X" : "O";
}

export function useGameState() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(
    getRandomStartingPlayer()
  );
  const [scores, setScores] = useState<GameScores>({
    X: 0,
    O: 0,
    draws: 0,
  });

  const gameStatus = getGameStatus(board);

  const makeMove = useCallback(
    (row: number, col: number) => {
      // Don't allow moves if game is over or cell is already filled
      if (gameStatus.status !== "playing" || board[row][col] !== null) {
        return false;
      }

      // Don't allow moves if it's not the current player's turn
      if (!currentPlayer) {
        return false;
      }

      // Make the move
      const newBoard = applyMoveToBoard(board, row, col, currentPlayer);

      setBoard(newBoard);

      // Check game status after move
      const newGameStatus = getGameStatus(newBoard);

      // Update scores if game ended
      if (newGameStatus.status === "won" && newGameStatus.winner) {
        setScores((prev) => ({
          ...prev,
          [newGameStatus.winner!]: prev[newGameStatus.winner!] + 1,
        }));
      } else if (newGameStatus.status === "draw") {
        setScores((prev) => ({
          ...prev,
          draws: prev.draws + 1,
        }));
      }

      // Switch player only if game is still playing
      if (newGameStatus.status === "playing") {
        setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
      } else {
        // Game ended, no more moves
        setCurrentPlayer(null);
      }

      return true;
    },
    [board, currentPlayer, gameStatus.status]
  );

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(getRandomStartingPlayer());
  }, []);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
  }, []);

  const gameState: GameState = {
    board,
    currentPlayer,
    status: gameStatus.status,
    winner: gameStatus.winner,
    winningCells: gameStatus.winningCells,
  };

  return {
    gameState,
    scores,
    makeMove,
    resetGame,
    resetScores,
  };
}
