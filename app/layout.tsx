import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit"
});

export const metadata: Metadata = {
  title: "Aurora Finance",
  description:
    "Dashboard financeiro pessoal com Tailwind, daisyUI, Tremor e base pronta para Supabase."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="night">
      <body className={`${outfit.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}

