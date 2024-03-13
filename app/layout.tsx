import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/header";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

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
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser(); 
  return (
    <html lang="en">
      <body>
        <Header isAuthed={!!user} />
        <main>{children}</main>
        <script
          async
          src="https://kit.fontawesome.com/cf8a647076.js"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
