import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import AppProviders from "@/components/providers/app-providers.client";

// GeistSans and GeistMono are imported directly with variable support

export const metadata: Metadata = {
  title: "Simple Tracker",
  description: "Mobile-first PWA for field workers to log workdays and submit tickets"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
