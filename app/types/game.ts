export type Player = "X" | "O" | null;
export type CellValue = Player;
export type Board = CellValue[][];

export type GameStatus = "playing" | "won" | "draw";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player;
  winningCells: number[]; // Flat indices of winning cells (0-8)
}

export interface GameScores {
  X: number;
  O: number;
  draws: number;
}
