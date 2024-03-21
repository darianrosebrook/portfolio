"use client";
import { useState } from "react";
import Tiptap from "@/components/tiptap/tiptap";
import { Article } from "app/types";
import debounce from "@/utils/debounce";
import { numberToWordValue } from "@/utils/index";
import { createClient } from "@/utils/supabase/client";

const articleDefaults = {
  alternativeHeadline: null,
  articleBody: null,
  articleSection: null,
  author: null,
  created_at: new Date().toISOString(),
  description: null,
  draft: true,
  editor: null,
  headline: null,
  image: null,
  keywords: null,
  modified_at: new Date().toISOString(),
  published_at: null,
  wordCount: 0,
  slug: null,
};

const NewArticle = () => {
  const [isDraft, setIsDraft] = useState(articleDefaults.draft);
  const [article, setArticle] = useState(articleDefaults);
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDraft(e.target.checked);
    setArticle({ ...article, draft: e.target.checked });
  };

  const pushChanges = (article: Article) => {
    // push changes to the server
    console.log(article);
  };
  const handleUpdate = debounce((article: Article) => {
    setArticle(article);
    pushChanges(article);
  }, 1000); // If the user stops typing for 10 seconds, push the changes to the server
  const handlePublish = async () => {
    // publish the article
    let response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(article),
    });
    console.log(response); 
    return response;
  };

  return (
    <Tiptap
      handleUpdate={handleUpdate}
      article={article}
      handlePublish={handlePublish}
      setDraft={handleToggle}
    />
  );
};

export default NewArticle;
