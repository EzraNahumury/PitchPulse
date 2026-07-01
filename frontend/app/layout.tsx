import type { Metadata } from "next";
import { Geist, Barlow_Condensed, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import SolanaProvider from "@/components/SolanaProvider";
import ExtensionErrorGuard from "@/components/ExtensionErrorGuard";

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const display = Barlow_Condensed({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Editorial serif for accent words on the landing (used italic).
const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600"],
});

const data = IBM_Plex_Mono({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PitchPulse — see who's winning the moment",
  description:
    "The live momentum of every World Cup match, read from the market and explained as it happens. Momentum and sentiment — not betting.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${serif.variable} ${data.variable} h-full antialiased`}
    >
      <body className="pitch-bg min-h-full">
        <ExtensionErrorGuard />
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
