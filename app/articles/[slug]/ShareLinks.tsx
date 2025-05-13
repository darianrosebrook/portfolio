'use client';
import { Article } from '@/types';
import styles from './styles.module.css';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

export default function ShareLinks({
  url,
  article,
}: {
  url: string;
  article: Article;
}) {
  const faTwitter = byPrefixAndName['fab']['twitter'];
  const faFacebook = byPrefixAndName['fab']['facebook'];
  const faLinkedin = byPrefixAndName['fab']['linkedin'];
  const faLink = byPrefixAndName['far']['link'];
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
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            <Icon icon={faLink} />
          </Button>
        </li>
        <li>
          <Button
            variant="primary"
            as="a"
            title="Share on Twitter"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(url)}`}
            size="medium"
          >
            <Icon icon={faTwitter} />
          </Button>
        </li>
        <li>
          <Button
            variant="primary"
            as="a"
            title="Share on Facebook"
            href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`}
            size="medium"
          >
            <Icon icon={faFacebook} />
          </Button>
        </li>
        <li>
          <Button
            variant="primary"
            as="a"
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.headline)}`}
            title="Share on LinkedIn"
          >
            <Icon icon={faLinkedin} />
          </Button>
        </li>
      </ul>
    </div>
  );
}
