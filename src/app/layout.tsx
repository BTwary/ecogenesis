import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ECOGENESIS — Environmental Intelligence Platform",
  description:
    "Measure your environmental impact with traceable data, explore AI-guided sustainability actions, and turn intentions into measurable, verifiable environmental outcomes.",
  keywords: [
    "sustainability",
    "carbon footprint",
    "environmental intelligence",
    "air quality",
    "water conservation",
    "renewable energy",
    "biodiversity",
  ],
  authors: [{ name: "ECOGENESIS" }],
  openGraph: {
    title: "ECOGENESIS — Environmental Intelligence Platform",
    description:
      "Make sustainability measurable. Real environmental data, transparent calculations, and AI-guided action.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1410",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
