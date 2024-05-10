// Next
import NextImage from "next/image";
import ProfileFlag from "@/component/ProfileFlag";

// TipTap
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";
import CustomDocument from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { generateHTML } from "@tiptap/html";
import { JSONContent } from "@tiptap/react";
import { Database } from "app/types/supabase";

import styles from "./styles.module.css";
function getArticleContent(data: JSONContent) {
  let html: string = generateHTML(data, [
    CharacterCount,
    Image,
    CustomDocument,
    StarterKit.configure({
      document: false,
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") {
          return "What’s the title?";
        }
        return "Can you add some further context?";
      },
    }),
    CodeBlockLowlight,
  ]);
  console.log(html);
  const h1FromHTML = html.match(/<h1>(.*?)<\/h1>/);
  const imageFromHTML = html.match(/<img(.*?)>/);
  h1FromHTML && (html = html.replace(h1FromHTML[0], ""));
  imageFromHTML && (html = html.replace(imageFromHTML[0], ""));
  const content = { h1FromHTML, imageFromHTML, html };
  return content;
}

export default async function Notes({
  article,
}: {
  article: Database["public"]["Tables"]["articles"]["Row"];
}) {
  const contents = getArticleContent(article.articleBody);
  const { h1FromHTML, imageFromHTML, html } = contents;
  const format = (
    <>
      <div className={styles.articleLede}>
        {article.articleSection && (
          <p className="small uppercase">
            {article.articleSection}
            {article.keywords &&
              ` |  ${article.keywords.split(",").join(" | ")}`}
          </p>
        )}
        <h1>{article.headline}</h1>
        {article.alternativeHeadline && (
          <h2 className="medium light">{article.alternativeHeadline}</h2>
        )}
        <hr />
        <div className={styles.meta}>
          <div className={styles.byline}>
            <p className="small">
              Published on{" "}
              <time dateTime={article.published_at}>
                <small className="bold">
                  {new Date(article.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </small>
              </time>{" "}
              by
            </p>
            <ProfileFlag profile={article.author} />
          </div>
        </div>
      </div>
      <NextImage
        src={article.image}
        alt={article.headline}
        width={500}
        height={300}
      />
      <p className="caption"></p>
      <div
        className={styles.articleContent}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
  return <article className={styles.articleContent}>{format}</article>;
}
