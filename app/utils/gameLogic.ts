import { Board, Player, GameStatus } from "../types/game";

/**
 * Creates an empty 3x3 tic-tac-toe board
 */
export function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

/**
 * Applies a move to the board and returns a new board
 */
export function applyMoveToBoard(
  board: Board,
  row: number,
  col: number,
  player: Player
): Board {
  return board.map((r, rIdx) =>
    r.map((cell, cIdx) => (rIdx === row && cIdx === col ? player : cell))
  );
}

/**
 * Checks if a player has won and returns the winning cells
 * @returns Object with winner and array of winning cell indices (0-8), or null if no winner
 */
export function checkWinner(board: Board): {
  winner: Player;
  winningCells: number[];
} | null {
  const lines = [
    // Rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    const rowA = Math.floor(a / 3);
    const colA = a % 3;
    const rowB = Math.floor(b / 3);
    const colB = b % 3;
    const rowC = Math.floor(c / 3);
    const colC = c % 3;

    if (
      board[rowA][colA] &&
      board[rowA][colA] === board[rowB][colB] &&
      board[rowA][colA] === board[rowC][colC]
    ) {
      return {
        winner: board[rowA][colA] as Player,
        winningCells: line,
      };
    }
  }

  return null;
}

/**
 * Checks if the board is full (draw condition)
 */
export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

/**
 * Determines the game status based on the board state
 */
export function getGameStatus(board: Board): {
  status: GameStatus;
  winner: Player;
  winningCells: number[];
} {
  const winnerResult = checkWinner(board);
  if (winnerResult) {
    return {
      status: "won",
      winner: winnerResult.winner,
      winningCells: winnerResult.winningCells,
    };
  }

  if (isBoardFull(board)) {
    return {
      status: "draw",
      winner: null,
      winningCells: [],
    };
  }

  return {
    status: "playing",
    winner: null,
    winningCells: [],
  };
}
