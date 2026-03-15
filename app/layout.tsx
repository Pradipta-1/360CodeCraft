import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "FitConnect",
  description: "Find trainers, join events, build your fitness community."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}

