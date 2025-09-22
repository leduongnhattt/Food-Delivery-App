import type { ReactNode } from "react";
import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HanalaFood - Sign Up",
  description: "Create a new HanalaFood account",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
