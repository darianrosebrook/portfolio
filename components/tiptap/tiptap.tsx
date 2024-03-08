"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./tiptap.module.css";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/avatar/avatar";
import { Database } from "app/types/supabase";

const Tiptap = ({
  article,
}: {
  article: Database["public"]["Tables"]["articles"]["Row"];
}) => {
  const content = article.articleBody as JSONContent;
  const editor = useEditor({
    content: content,
    extensions: [StarterKit],
  });
  return (
    <>
      <EditorContent editor={editor} className={styles.editor} />
    </>
  );
};

export default Tiptap;
