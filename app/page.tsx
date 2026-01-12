"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WelcomeScreen from "./ui/components/WelcomeScreen";
import { getUserMode, getUserStatus, getStoredRoomId } from "./utils/userState";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Handle reconnection: restore user state
    const userMode = getUserMode();
    const userStatus = getUserStatus();
    const roomId = getStoredRoomId();

    if (userMode === "random" && userStatus === "waiting") {
      // Auto-rejoin matchmaking
      router.push("/random");
    } else if (userMode === "random" && userStatus === "matched" && roomId) {
      // Rejoin game room
      router.push(`/game/${roomId}`);
    } else if (userMode === "friend" && roomId) {
      // Rejoin friend game room
      router.push(`/game/${roomId}`);
    }
    // Otherwise show welcome screen
  }, [router]);

  return <WelcomeScreen />;
}
