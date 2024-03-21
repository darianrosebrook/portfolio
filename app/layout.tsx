import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { createClient } from "@/utils/supabase/server";
import Footer from "@/components/footer";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});
const nohemi = localFont({
  src: "../public/fonts/Nohemi-VF.ttf",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
  weight: "100 900",
  variable: '--font-nohemi',
});

export const metadata: Metadata = {
  title: "Darian Rosebrook: Product Designer | Design Systems, Portland Oregon",
  description:
    "Hey! I'm Darian Rosebrook 👋🏼 I am a product designer in the Portland, Oregon area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createClient();
  const response = await client.auth.getSession();
  const session = response.data.session;
  response.error && console.error("error", response.error);
  const isAuthed = session !== null;
  return (
    <html lang="en" className={`${inter.className} ${nohemi.variable}`}>
      <body>
        <Navbar isAuthed={isAuthed} />
        <main>{children}</main>
        <Footer />
        <script
          async
          src="https://kit.fontawesome.com/cf8a647076.js"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
