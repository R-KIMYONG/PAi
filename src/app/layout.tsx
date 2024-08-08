import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./_providers";
import PathObserver from "./(main)/diary/_components/PathObserver";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | PAi",
    default: "PAi"
  },
  description: "Generated by create next app"
  // icons : {
  //   // favicon 위치
  //   icon :
  // }
};

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-custom">
        <PathObserver />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
