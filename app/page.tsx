"use client";
import Grid from "./ui/components/Grid";
import { useGameState } from "./hooks/useGameState";

export default function Home() {
  const { gameState, scores, makeMove, resetGame, resetScores } =
    useGameState();

  const getStatusMessage = () => {
    if (gameState.status === "won") {
      return `Player ${gameState.winner} wins!`;
    }
    if (gameState.status === "draw") {
      return "It's a draw!";
    }
    return `Player ${gameState.currentPlayer}'s turn`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-4">
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
      />

      {/* Score Display */}
      <div className="flex gap-8 text-lg">
        <div className="text-center">
          <div className="font-semibold text-blue-600">Player X</div>
          <div className="text-2xl font-bold">{scores.X}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-600">Draws</div>
          <div className="text-2xl font-bold">{scores.draws}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">Player O</div>
          <div className="text-2xl font-bold">{scores.O}</div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          New Game
        </button>
        <button
          onClick={resetScores}
          className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 active:scale-95 transition-all"
        >
          Reset Scores
        </button>
      </div>
    </div>
  );
}
