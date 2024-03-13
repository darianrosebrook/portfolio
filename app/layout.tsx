import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/header";
import { createClient } from "@/utils/supabase/server";

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
  const { data, error } = await client.auth.getUser();
  if (error) {
    console.error(error);
  }
  const isAuth = data?.user !== undefined;
  return (
    <html lang="en">
      <body>
        <Header isAuthed={isAuth} />
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
