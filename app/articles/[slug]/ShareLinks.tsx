"use client";
import { Article } from "app/types";
import styles from "./styles.module.css";
import Button from "@/components/Button";
import { byPrefixAndName } from "@awesome.me/kit-0ba7f5fefb/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ShareLinks({
  url,
  article,
}: {
  url: string;
  article: Article;
}) {

  const faTwitter = byPrefixAndName["fab"]["twitter"];
  const faFacebook = byPrefixAndName["fab"]["facebook"];
  const faLinkedin = byPrefixAndName["fab"]["linkedin"];
  const faLink = byPrefixAndName["far"]["link"];
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
      <div className={styles.share}>
        <p className="small">Share to</p>
      </div>
      <ul>
        <li>
          <Button
            variant="primary"
            handleClick={handleCopy}
            size="medium"
            title="Copy to clipboard"><FontAwesomeIcon icon={faLink} /></Button>
        </li>
        <li>
          <Button variant="primary"
            title="Share on Twitter"
            handleClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(url)}`); }} size="medium"
          ><FontAwesomeIcon icon={faTwitter} /></Button>
        </li>
        <li>
          <Button variant="primary"
            title="Share on Facebook"
            handleClick={() => { window.open(`https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`); }} size="medium"
          ><FontAwesomeIcon icon={faFacebook} /></Button>
        </li>
        <li>
          <Button variant="primary"
            title="Share on LinkedIn"
            handleClick={() => { window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.headline)}`); }} size="medium"
          ><FontAwesomeIcon icon={faLinkedin} /></Button>
        </li>
      </ul>
    </div>
  );
}
