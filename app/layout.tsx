import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bank Jago PDF Statement Parser",
  description:
    "Convert Bank Jago PDF statements to CSV/Excel format. Process files locally without uploading to any server.",
  keywords: [
    "Bank Jago",
    "PDF",
    "statement",
    "parser",
    "converter",
    "CSV",
    "Excel",
  ],
  authors: [{ name: "Bank Jago Statement Parser" }],
  openGraph: {
    title: "Bank Jago PDF Statement Parser",
    description: "Convert Bank Jago PDF statements to CSV/Excel format",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
