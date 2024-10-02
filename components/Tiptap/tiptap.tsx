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

import ToggleSwitch from "@/components/ToggleSwitch";

import CodeBlockComponent from "./CodeBlockComponent";
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

import { Article } from "app/types";
import { calculateReadingTime } from "@/utils/index";
import { useState } from "react"; 
import Link from "next/link";

const CustomDocument = Document.extend({
  content: "heading block*",
});

const Tiptap = ({
  article,
  handleUpdate = null,
  handlePublish = null,
  setDraft = null,
}: {
  article: Article;
  handleUpdate?: (article: Article) => void;
  handlePublish?: () => void;
  setDraft?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [updatedArticle, setUpdatedArticle] = useState<Article>(article);
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

  const parseUpdateFromInput = (e) => {
    setUpdatedArticle({ ...updatedArticle, [e.target.name]: e.target.value });
    handleUpdate(updatedArticle);
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
          return ReactNodeViewRenderer(CodeBlockComponent as any);
        },
      }).configure({ lowlight }),
    ],
    onUpdate: ({ editor }) => {
      if (handleUpdate) {
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
    <div className={styles.editorGroups}>
      <div className={styles.publishBar}>
<Link href={`/dashboard/articles/${article.slug}/preview`}>Preview</Link>
        <button className="publishButton" onClick={handlePublish}>
          {article.draft ? "Save Draft" : "Publish"}
        </button>
      </div>
      <div className="grid">
        <div>
          <label htmlFor="headline">Headline</label>
          <input
            type="text"
            name="headline"
            placeholder="Title"
            value={updatedArticle.headline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="alternativeHeadline">Alternative Headline</label>
          <input
            type="text"
            name="alternativeHeadline"
            placeholder="Alternative Headline"
            value={updatedArticle.alternativeHeadline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={updatedArticle.description}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            name="keywords"
            placeholder="Keywords"
            value={updatedArticle.keywords}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={updatedArticle.image}
            onChange={parseUpdateFromInput}
          />
        </div>   
        <div>
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={updatedArticle.slug}
            onChange={parseUpdateFromInput}
          />
        </div> 
        <div>
          <label htmlFor="articleSection">Article Section</label>
          <input
            type="text"
            name="articleSection"
            placeholder="Article Section"
            value={updatedArticle.articleSection}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="published_at">published_at</label>
          <input
            type="date"
            name="published_at"
            value={ updatedArticle.created_at && new Date(updatedArticle.created_at).toISOString().split("T")[0] }
            onChange={parseUpdateFromInput}
          />
        </div>
      </div>
      <p className="minuteInWords">
        Reading time:{" "}
        <strong>{calculateReadingTime(article.wordCount)} minute read</strong>
      </p>
      <ToggleSwitch checked={article.draft} onChange={setDraft}>
        Draft
      </ToggleSwitch>
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  );
};

export default Tiptap;
