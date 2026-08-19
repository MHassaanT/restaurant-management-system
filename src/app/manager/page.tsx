"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/management");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-xl font-bold text-amber-500 animate-pulse">
          Redirecting to Management & Setup Dashboard...
        </p>
      </div>
    </div>
  );
}
