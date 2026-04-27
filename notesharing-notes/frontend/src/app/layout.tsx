import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "NoteSharing - Cloud Study Platform",
  description: "Upload, share, and discover study notes with AI-powered features",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
