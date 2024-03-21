"use client";

import {
  useEditor,
  EditorContent,
  JSONContent,
  ReactNodeViewRenderer,
  Node,
} from "@tiptap/react"; 
import styles from "./tiptap.module.css";
import StarterKit from "@tiptap/starter-kit"; 
import Image from "./ImageExtended";
import Document from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import CharacterCount from "@tiptap/extension-character-count";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import { common, createLowlight } from "lowlight";
import ProfileFlag from "../ProfileFlag";
import ToggleSwitch from "@/components/toggleSwitch";

import CodeBlockComponent from "./CodeBlockComponent";
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

import { Article } from "app/types";
import { numberToWordValue } from "@/utils/index";

// alternativeHeadline: string | null
// articleBody: JSONContent | null
// articleSection: string | null
// author: Database["public"]["Tables"]["profiles"]["Row"] | null
// created_at: string | null
// description: string | null
// draft: boolean | null
// editor: string | null
// headline: string | null
// id: number
// image: string | null
// keywords: string | null
// modified_at: string | null
// published_at: string | null
// wordCount: number | null
// slug: string | null

const CustomDocument = Document.extend({
  content: "heading block*",
});

const byLine = (article: Article) => {
  return (
    <div className="byline">
      <ProfileFlag
        profile={article.author} 
      />
      <p>
        {article.author?.username} -{" "}
        {new Date(article.published_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}

const Tiptap = ({
  article,
  handleUpdate = null,
  handlePublish = null,
  setDraft = null,
}: {
  article?: any;
  handleUpdate?: (article: Article) => void;
  handlePublish?: () => void;
  setDraft?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {


  const images = new Map<string, string>();
  const content = article?.articleBody as JSONContent | undefined;

  const getH1FromArticleBody = (articleBody) => {
    const h1 = articleBody.content.find(
      (node) => node.type === "heading" && node.attrs.level === 1
    ); 
    return h1?.content?.[0]?.text || null;
  };
  const getArticleImage = (articleBody) => {
    const image = articleBody.content.find((node) => node.type === "image");  
    return image?.attrs.src || null;
  };
  const createSlugFromHeadline = (headline: string) => {
    return headline
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }; 


  const editor = useEditor({
    content: content,
    extensions: [
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
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
    ],
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
        let updatedArticle: Article = { ...article };
        updatedArticle.articleBody = editor.getJSON();
        updatedArticle.headline = getH1FromArticleBody(
          updatedArticle.articleBody
        );
        updatedArticle.alternativeHeadline = updatedArticle.headline;
        updatedArticle.wordCount = editor.storage.characterCount.words();
        updatedArticle.modified_at = updatedArticle.published_at
          ? new Date().toISOString()
          : null;
        updatedArticle.slug =
          (updatedArticle.headline &&
            createSlugFromHeadline(updatedArticle.headline)) ||
          null;
        updatedArticle.image = getArticleImage(updatedArticle.articleBody);
        handleUpdate(updatedArticle);
      }
    }, 
  });

  return (
    <>
    <div className="publishBar"> 
      <button className="publishButton" onClick={handlePublish}>
       {  article.draft ? "Save Draft" : "Publish" }
      </button>
    </div>
    <p className="minuteInWords">
      Reading time:{" "}
      <strong>
        {numberToWordValue(article.wordCount)} minute read
      </strong>
    </p>
    <ToggleSwitch checked={article.draft} onChange={setDraft}>
      Draft
    </ToggleSwitch>
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export default Tiptap;
