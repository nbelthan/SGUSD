import type { Metadata } from "next";
import PrivyProvider from "@/components/providers/PrivyProvider";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="font-sans min-h-screen">
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}
