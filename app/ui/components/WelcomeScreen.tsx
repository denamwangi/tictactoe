"use client";
import { useRouter } from "next/navigation";
import { setUserMode } from "../../utils/userState";

export default function WelcomeScreen() {
  const router = useRouter();

  const handlePlayWithFriend = () => {
    setUserMode("friend");
    router.push("/friend");
  };

  const handlePlayRandom = () => {
    setUserMode("random");
    router.push("/random");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-2">Tic Tac Toe</h1>
        <p className="text-gray-600">Choose how you want to play</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={handlePlayWithFriend}
          className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
        >
          Play with Friend
        </button>

        <button
          onClick={handlePlayRandom}
          className="px-8 py-4 bg-green-600 text-white font-semibold text-lg rounded-lg hover:bg-green-700 active:scale-95 transition-all"
        >
          Play Random Opponent
        </button>
      </div>
    </div>
  );
}
