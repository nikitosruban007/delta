import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoldUP | Об'єднуємо інтелект",
  description: "Платформа для командних освітніх турнірів",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="scroll-smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
