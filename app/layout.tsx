import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1-Click Visual Study Notes",
  description: "Convert messy lecture notes into marker-style revision sheets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Bulletproof Tailwind CSS fallback so styles NEVER fail in dev or Vercel */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased bg-neutral-100 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
