"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { Database } from "app/types/supabase";
import styles from "./tiptap.module.css";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// upload image
import { upload } from "@/utils/upload";

const Tiptap = ({
  article,
}: {
  article?: Database["public"]["Tables"]["articles"]["Row"];
}) => {
  const images = new Map<string, string>();
  const content = article?.articleBody as JSONContent | undefined;
  const editor = useEditor({
    content: content,
    extensions: [StarterKit, Image],
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
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export default Tiptap;
