"use client";
import { Article } from "app/types";
import styles from "./styles.module.css";
import Button from "@/components/Button";

export default function ShareLinks({
  url,
  article,
}: {
  url: string;
  article: Article;
}) {
  const handleCopy = () => {
    // replace contents of button with a checkmark to indicate success
    const copyButton = document.querySelector(`.${styles.links} button`);
    copyButton.innerHTML = "<i class='fa fa-check'></i>";
    setTimeout(() => {
      copyButton.innerHTML = "<i class='fa fa-link'></i>";
    }, 2000);
    // copy url to clipboard
    navigator.clipboard.writeText(url);
  };
  return (
    <div className={styles.links}>
      <p className="small">Share to</p>
      <i className="fa fa-arrow-right">
        <span>Share</span>
      </i>
      <ul>
        <li>
          <Button variant="primary" handleClick={handleCopy} size="medium" title="Copy to clipboard">
            <i className="fa fa-link">
              <span>Copy Link</span>
            </i>
          </Button>
        </li>
        <li>
          <Button variant="primary" 

            title="Share on Twitter"
            handleClick={() => {
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  article.headline
                )}&url=${encodeURIComponent(url)}`
              );
            }}
            size="medium"
          >
            <i className="fa fa-twitter">
              <span>Share on Twitter</span>
            </i>
          </Button>
        </li>
        <li>
          <Button variant="primary"
            title="Share on Facebook"
            handleClick={() => {
              window.open(
                `https://www.facebook.com/sharer.php?u=${encodeURIComponent(
                  url
                )}`
              );
            }}
            size="medium"
          >
            <i className="fa fa-facebook">
              <span>Share on Facebook</span>
            </i>
          </Button>
        </li>
        <li>
          <Button variant="primary"
            title="Share on LinkedIn"
            handleClick={() => {
              window.open(
                `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                  url
                )}&title=${encodeURIComponent(article.headline)}`
              );
            }}
            size="medium"
          >
            <i className="fa fa-linkedin">
              <span>Share on LinkedIn</span>
            </i>
          </Button>
        </li>
      </ul>
    </div>
  );
}
