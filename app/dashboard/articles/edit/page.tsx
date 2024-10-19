"use client";
import { useState } from "react";
import { Tiptap } from "@/components/Tiptap";
import { Article } from "app/types";

import { calculateReadingTime, debounce } from "@/utils";

import ToggleSwitch from "@/components/ToggleSwitch";
import Link from "next/link";

import styles from "./page.module.scss";

const articleDefaults: Article = {
  alternativeHeadline: null,
  articleSection: null,
  articleBody:  null,
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

const EditArticle = () => {
  const [article, setArticle] = useState(articleDefaults);
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArticle({ ...article, draft: e.target.checked });
  };

  const pushChanges = (article: Article) => {
    // push changes to the server
    console.log(article);
  };
  const handleUpdate = debounce((article: Article) => {
    let updatedArticle = { ...article };
    updatedArticle.headline = getH1FromArticleBody(
      updatedArticle.articleBody
    );
    updatedArticle.alternativeHeadline = updatedArticle.headline;
    updatedArticle.modified_at = updatedArticle.published_at
      ? new Date().toISOString()
      : null;
    updatedArticle.slug =
      (updatedArticle.headline &&
        createSlugFromHeadline(updatedArticle.headline)) ||
      null;
    updatedArticle.image = getArticleImage(updatedArticle.articleBody);
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
    setArticle({ ...article, [e.target.name]: e.target.value });
    handleUpdate(article);
  };

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
            value={article.headline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="alternativeHeadline">Alternative Headline</label>
          <input
            type="text"
            name="alternativeHeadline"
            placeholder="Alternative Headline"
            value={article.alternativeHeadline}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            placeholder="Description"
            value={article.description}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="keywords">Keywords</label>
          <input
            type="text"
            name="keywords"
            placeholder="Keywords"
            value={article.keywords}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="image">Image</label>
          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={article.image}
            onChange={parseUpdateFromInput}
          />
        </div>   
        <div>
          <label htmlFor="slug">Slug</label>
          <input
            type="text"
            name="slug"
            placeholder="Slug"
            value={article.slug}
            onChange={parseUpdateFromInput}
          />
        </div> 
        <div>
          <label htmlFor="articleSection">Article Section</label>
          <input
            type="text"
            name="articleSection"
            placeholder="Article Section"
            value={article.articleSection}
            onChange={parseUpdateFromInput}
          />
        </div>
        <div>
          <label htmlFor="published_at">published_at</label>
          <input
            type="date"
            name="published_at"
            value={ article.created_at && new Date(article.created_at).toISOString().split("T")[0] }
            onChange={parseUpdateFromInput}
          />
        </div>
      </div>
      <p className="minuteInWords">
        Reading time:{" "}
        <strong>{calculateReadingTime(article.wordCount)} minute read</strong>
      </p>
      <ToggleSwitch checked={article.draft} onChange={handleToggle}>
        Draft
      </ToggleSwitch>
      <Tiptap
        handleUpdate={handleUpdate}
        article={article} 
      />
    </div>
  );
};

export default EditArticle;
