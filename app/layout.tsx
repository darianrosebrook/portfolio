import type { Metadata } from "next";
import "./globals.scss";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";
import Footer from "@/components/Footer";
import localFont from "next/font/local";
import SlinkyCursor from "@/components/SlinkyCursor";

// If loading a variable font, you don't need to specify the font weight
const nohemi = localFont({
  src: "../public/fonts/Nohemi-VF.ttf",
  display: "swap",
  fallback: ["sans-serif"],
  preload: true,
  weight: "100 900",
  variable: "--font-nohemi",
});
const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  fallback: ["sans-serif"],
  display: "auto",
  weight: "100 900",
  variable: "--font-inter",
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
    <html lang="en" className={`${inter.variable} ${nohemi.variable}`}>
      <body>
        <svg className="pointer-events-none absolute cursor-none">
          <filter id="grainy">
            <feTurbulence type="turbulence" baseFrequency="0.5"></feTurbulence>
            <feColorMatrix type="saturate" values="0"></feColorMatrix>
          </filter>
        </svg>
      
        <Navbar isAuthed={isAuthed} />
        <main>{children}</main>
        <Footer />
        <SlinkyCursor />
        <script
          async
          src="https://kit.fontawesome.com/cf8a647076.js"
          crossOrigin="anonymous"
        ></script>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="4"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
