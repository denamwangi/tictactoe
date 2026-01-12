import { Board } from "../../types/game";

interface GridProps {
  board: Board;
  winningCells: number[];
  gameStatus: "playing" | "won" | "draw";
  onCellClick: (row: number, col: number) => void;
}

export default function Grid({
  board,
  winningCells,
  gameStatus,
  onCellClick,
}: GridProps) {
  const isGameOver = gameStatus !== "playing";

  const getCellColor = (cell: string | null) => {
    if (cell === "X") return "text-blue-600";
    if (cell === "O") return "text-red-600";
    return "text-gray-900";
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full max-w-[50vw] max-h-[50vh] aspect-square">
      {board.flatMap((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          const flatIndex = rowIndex * 3 + cellIndex;
          const winning = winningCells.includes(flatIndex);
          const disabled = isGameOver || cell !== null;

          return (
            <button
              key={`${rowIndex}-${cellIndex}`}
              onClick={() => onCellClick(rowIndex, cellIndex)}
              disabled={disabled}
              className={`
                bg-white border-2 aspect-square flex items-center justify-center 
                text-4xl font-bold w-full h-full transition-all
                ${winning ? "bg-green-100 border-green-500" : "border-gray-300"}
                ${
                  disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-gray-50"
                }
                ${!disabled ? "active:scale-95" : ""}
                ${getCellColor(cell)}
              `}
            >
              {cell || ""}
            </button>
          );
        })
      )}
    </div>
  );
}
