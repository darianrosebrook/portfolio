"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { Database } from "app/types/supabase";
import styles from "./tiptap.module.css";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Document from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import ToggleSwitch from "../toggleSwitch/toggleSwitch";



// upload image
import { upload } from "@/utils/upload";
import { useState } from "react";

const CustomDocument = Document.extend({
  content: "heading block*",
});
const numberToWordValue = (num: number) => {
  num = Math.floor(num / 300);
  if (num < 1) return "less than a minute";
  if (num === 1) return "a minute";
  if (num < 60) return `${num} minutes`;
  if (num === 60) return "an hour";
  if (num < 1440) return `${Math.floor(num / 60)} hours`;
  if (num === 1440) return "a day";
  return `${Math.floor(num / 1440)} days`;
};

const Tiptap = ({
  article,
}: {
  article?: Database["public"]["Tables"]["articles"]["Row"];
}) => {
  const [isDraft, setIsDraft] = useState(false);
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDraft( !isDraft);
  }
  const images = new Map<string, string>();
  const content = article?.articleBody as JSONContent | undefined;
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
    ],
    editorProps: {
      handleDrop: function (view, event, slice, moved) {
        if (
          !moved &&
          event.dataTransfer &&
          event.dataTransfer.files &&
          event.dataTransfer.files[0]
        ) {
          const file = event.dataTransfer.files[0];
          const newImage = document.createElement("img");
          newImage.src = URL.createObjectURL(file);
          newImage.onload = async () => {
            const path = await upload({
              file: {
                type: "image",
                media: {
                  name: file.name,
                  data: file,
                },
              },
              bucket: "article-images",
            });
            images.set(file.name, path);

            const { schema } = view.state;
            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            const node = schema.nodes.image.create({ src: path }); // creates the image element
            const transaction = view.state.tr.insert(coordinates.pos, node); // places it in the correct position
            return view.dispatch(transaction);
          };
        } else {
          return false;
        }
      },
    },
  });
  return (
    <>
      {editor && (
        <p className="minuteInWords">
          Reading time:{' '}
          <strong>
            {numberToWordValue(editor.storage.characterCount.words())} minute
            read
          </strong>
        </p>
      )} <ToggleSwitch checked={isDraft} onChange={handleToggle}>Draft</ToggleSwitch> 
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export default Tiptap;
