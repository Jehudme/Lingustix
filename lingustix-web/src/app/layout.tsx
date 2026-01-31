import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui";

export const metadata: Metadata = {
  title: "Lingustix - Language Learning & Composition Platform",
  description: "A state-of-the-art language learning and composition evaluation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="font-sans antialiased bg-slate-950 text-slate-100"
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
