import type { Metadata } from "next";
import "./globals.css";

import { GlobalTimer } from "@/components/GlobalTimer";

export const metadata: Metadata = {
  title: "NAAR Management System",
  description: "Restaurant Management Prototype for NAAR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <GlobalTimer />
        {children}
      </body>
    </html>
  );
}
