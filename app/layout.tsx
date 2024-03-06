import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/header";

export const metadata: Metadata = {
  title: "Darian Rosebrook: Product Designer | Design Systems, Portland Oregon",
  description:
    "Hey! I'm Darian Rosebrook 👋🏼 I am a product designer in the Portland, Oregon area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
};
const HTMLComment = ({ html = "" }) => (
  <script dangerouslySetInnerHTML={{ __html: `</script>\n${html}\n<script>` }} />
);
const bongos = `<!-- Cue bongos -->
    <!--
                               I think it's time we blow this scene.
                               Get everybody and the stuff together.

    ,----..                         .--,-\`\`-.
   /   /   \\       ,-.             /   /     '.                    ,----,                 ,---,
  /   .     :  ,--/ /|            / ../        ;                 .'   .' \\             ,\`--.' |
 .   /   ;.  ,--. :/ |            \\ \`\`\\  .\`-    '              ,----,'    |           /    /  :
.   ;   /  \` :  : ' /              \\___\\/   \\   :              |    :  .  ;          :    |.' '
;   |  ; \\ ; |  '  /                    \\   :   |              ;    |.'  /           \`----':  |
|   :  | ; | '  |  :                    /  /   /               \`----'/  ;               '   ' ;
.   |  ' ' ' |  |   \\                   \\  \\   \\                 /  ;  /                |   | |
'   ;  \\; /  '  : |. \\              ___ /   :   |               ;  /  /-,               '   : ;
 \\   \\  ',  /|  | ' \\ \\            /   /\\   /   :              /  /  /.\`|               |   | '
  ;   :    / '  : |--___          / ,,/  ',-    ___          ./__;      ___             '   : |___
   \\   \\ .'  ;  |,' /  .\\         \\ ''\\        /  .\\         |   :    ./  .\\            ;   |./  .\\
    \`---\`    '--'   \\_ ; |         \\   \\     .'\\_ ; |        ;   | .'  \\_ ; |           '---' \\_ ; |
                    /  ,"           \`--\`-,,-'  /  ,"         \`---'     /  ,"                  /  ,"
                   '--'                       '--'                    '--'                    --'
                ___           __    __                                            __
               /\\_ \\         /\\ \\__/\\ \\                   __                     /\\ \\
               \\//\\ \\      __\\ \\ ,_\\ \\/      ____        /\\_\\     __      ___ ___\\ \\ \\
                 \\ \\ \\   /'__\`\\ \\ \\/\\/      /',__\\       \\/\\ \\  /'__\`\\  /' __\` __\`\\ \\ \\
                  \\_\\ \\_/\\  __/\\ \\ \\_      /\\__, \`\\       \\ \\ \\/\\ \\L\\.\\_/\\ \\/\\ \\/\\ \\ \\_\\
                  /\\____\\ \\____\\\\ \\__\\     \\/\\____/       _\\ \\ \\ \\__/.\\_\\ \\_\\ \\_\\ \\_\\/\\_\\
                  \\/____/\\/____/ \\/__/      \\/___/       /\\ \\_\\ \\/__/\\/_/\\/_/\\/_/\\/_/\\/_/
                                                         \\ \\____/
                                                          \\/___/         -->`;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <HTMLComment html={bongos} /></head>
      <body>
        <Header />
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
