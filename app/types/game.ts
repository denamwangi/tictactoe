export type Player = "X" | "O" | null;
export type PlayerRole = "X" | "O" | null; // Which player you are in multiplayer
export type CellValue = Player;
export type Board = CellValue[][];

export type GameStatus = "playing" | "won" | "draw";
export type RoomStatus = "waiting" | "ready" | "playing" | "finished";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player;
  winningCells: number[]; // Flat indices of winning cells (0-8)
}

export interface MultiplayerGameState extends GameState {
  playerRole: PlayerRole; // Which player you are (X or O)
  roomStatus: RoomStatus;
  playerCount: number;
  opponentConnected: boolean;
  roomId: string;
}

export interface GameScores {
  X: number;
  O: number;
  draws: number;
}
