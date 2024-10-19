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


import CodeBlockComponent from "./CodeBlockComponent";
const lowlight = createLowlight(common);

lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

import { Article } from "app/types";
import { useState } from "react"; 

const CustomDocument = Document.extend({
  content: "heading block*",
});

const Tiptap = ({
  article,
  handleUpdate = null,
}: {
  article: Article;
  handleUpdate?: (article: Article) => void; 
}) => {
  const [updatedArticle, setUpdatedArticle] = useState<Article>(article);
  const images = new Map<string, string>();
  const content = article?.articleBody as JSONContent | undefined;
  const editor = useEditor({
    content,
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
        updatedArticle.wordCount = editor.storage.characterCount.words();
        handleUpdate(updatedArticle);
      }
    },
  });

  return ( 
      <EditorContent editor={editor} className={styles.editor} /> 
  );
};

export default Tiptap;
