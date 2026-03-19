import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import PrivyProvider from "@/components/providers/PrivyProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sage Intacct — Sage Dollar (SGUSD)",
  description: "Keep payments on-network. Earn yield on idle capital. Pay anyone, instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${manrope.variable} ${inter.variable}`}>
      <body className="font-sans min-h-screen">
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}
