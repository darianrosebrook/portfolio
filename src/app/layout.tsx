import type { Metadata } from "next"; 
import "./globals.css";
 

export const metadata: Metadata = {
  title: "Darian Rosebrook: Product Designer | Design Systems, Portland Oregon",
  description: "Hey! I'm Darian Rosebrook 👋🏼 I am a product designer in the Portland, Oregon area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body >{children}</body>
    </html>
  );
}
