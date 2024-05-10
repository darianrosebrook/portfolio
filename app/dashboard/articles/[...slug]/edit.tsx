"use client";
import { Tiptap } from "@/component/Tiptap";
import debounce from "@/utils/debounce";
import { Article } from "app/types";
import { Database } from "app/types/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditArticle({
  article,
}: {
  article: Database["public"]["Tables"]["articles"]["Row"];
}) {
  let keyPairs = Object.entries(article).filter(
    (a) => !["articleBody", "author"].includes(a[0])
  );
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [updatedArticle, setUpdatedArticle] = useState(article);
  const [draft, setDraft] = useState(article.draft);
  const { author, image, articleBody, ...rest } = updatedArticle;

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.checked);
    setUpdatedArticle({ ...article, draft: e.target.checked });
  };
  const router = useRouter();
  const pushChanges = (article: Article) => {
    // push changes to the server
    console.log(article);
  };
  const handleUpdate = debounce((updates: Article) => {
    setUpdatedArticle(updates);
    pushChanges(updates);
  }, 1000); // If the user stops typing for 10 seconds, push the changes to the server
  const handlePublish = async () => {
    // publish the article
    let response = await fetch("/api/publish", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedArticle),
    });
    router.push("/dashboard/articles");
    return response;
  };
  return (
    <article className="articleContent">
      <Tiptap
        article={updatedArticle}
        handleUpdate={handleUpdate}
        handlePublish={handlePublish}
        setDraft={handleToggle}
      />
    </article>
  );
}
