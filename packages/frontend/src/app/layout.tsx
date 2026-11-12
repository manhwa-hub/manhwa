import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Manhwa Hub — Baca Cerita Favoritmu", template: "%s | Manhwa Hub" },
  description: "Temukan dan baca manhwa, manhua, manga, dan webtoon favoritmu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
