"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WaiterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/menu?table=token_table_1");
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <p className="text-xl font-bold text-amber-500 animate-pulse">
          Redirecting to Customer Mobile QR Menu...
        </p>
      </div>
    </div>
  );
}
