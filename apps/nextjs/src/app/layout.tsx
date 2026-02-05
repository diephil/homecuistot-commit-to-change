import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/shared/SonnerToaster";
import { Footer } from "@/components/shared/Footer";
import { NavigationProgress } from "@/components/shared/NavigationProgress";
import { ScrollToTop } from "@/components/shared/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeCuistot",
  description:
    "AI-powered voice assistant for home cooks. Know what you have, know what you can cook, eat better without thinking about it.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HomeCuistot",
  },
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <NavigationProgress />
        <ScrollToTop />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
