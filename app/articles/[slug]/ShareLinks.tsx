'use client';
import { useState } from 'react';
import { Article } from '@/types';
import styles from './styles.module.scss';
import Button from '@/ui/components/Button';
import Icon from '@/ui/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import { CheckIcon, LinkIcon } from '@/ui/components/Icon/LocalIcons';

export default function ShareLinks({
  url,
  article,
}: {
  url: string;
  article: Article;
}) {
  const [copied, setCopied] = useState(false);

  const faTwitter = byPrefixAndName['fab']['twitter'];
  const faFacebook = byPrefixAndName['fab']['facebook'];
  const faLinkedin = byPrefixAndName['fab']['linkedin'];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
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
            title={copied ? 'Copied!' : 'Copy to clipboard'}
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
          </Button>
        </li>
        <li>
          <Button
            variant="primary"
            as="a"
            title="Share on Twitter"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline ?? '')}&url=${encodeURIComponent(url)}`}
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
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(article.headline ?? '')}`}
            title="Share on LinkedIn"
          >
            <Icon icon={faLinkedin} />
          </Button>
        </li>
      </ul>
    </div>
  );
}
