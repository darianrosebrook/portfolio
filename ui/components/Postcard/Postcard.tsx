'use client';
import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';
import styles from './Postcard.module.scss';
import Image from 'next/image';
import Icon from '../Icon';
import {
  byPrefixAndName,
  IconDefinition,
} from '@awesome.me/kit-0ba7f5fefb/icons';
import Link from 'next/link';

const faHeart = byPrefixAndName['far']['heart'] as IconDefinition;
const faComments = byPrefixAndName['far']['comments-alt'] as IconDefinition;
const faRetweet = byPrefixAndName['far']['retweet-alt'] as IconDefinition;
const faExternalLink = byPrefixAndName['far'][
  'external-link'
] as IconDefinition;
interface PostcardContextType {
  postId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  embed?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    aspectRatio: {
      width: number;
      height: number;
    };
  };
  stats: {
    likes: number;
    replies: number;
    reposts: number;
  };
}

const PostcardContext = createContext<PostcardContextType | null>(null);

interface PostcardProps {
  children: ReactNode;
  postId: string;
  author: PostcardContextType['author'];
  timestamp: string;
  content: string;
  embed?: PostcardContextType['embed'];
  stats: PostcardContextType['stats'];
}

const usePostcard = () => {
  const context = useContext(PostcardContext);
  if (!context) {
    throw new Error('Postcard components must be used within a Postcard');
  }
  return context;
};

const Postcard: React.FC<PostcardProps> & {
  Header: React.FC<{ children: ReactNode }>;
  Body: React.FC<{ children: ReactNode }>;
  Footer: React.FC<{ children: ReactNode }>;
  Stats: React.FC<{ children: ReactNode }>;
  Author: React.FC;
  Timestamp: React.FC;
  Content: React.FC;
  Embed: React.FC;
  Like: React.FC;
  Reply: React.FC;
  Repost: React.FC;
  ExternalLink: React.FC<{ link: string }>;
} = ({ children, ...props }) => {
  return (
    <PostcardContext.Provider value={props}>
      <article className={styles.post}>{children}</article>
    </PostcardContext.Provider>
  );
};

const Header: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <header className={styles.header}>{children}</header>;
};

const Body: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.content}>{children}</div>;
};

const Footer: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <footer className={styles.footer}>{children}</footer>;
};

const Stats: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={styles.stats}>{children}</div>;
};

const Author: React.FC = () => {
  const { author } = usePostcard();
  return (
    <div className={styles.userInfo}>
      <p className={styles.displayName}>{author.name}</p>
      <p className={styles.handle}>@{author.handle}</p>
    </div>
  );
};
function getRelativeTimeString(date: Date | number) {
  const timeMs = typeof date === 'number' ? date : date.getTime();
  const deltaSeconds = -Math.round((timeMs - Date.now()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

  if (Math.abs(deltaSeconds) < 60) {
    return rtf.format(-deltaSeconds, 'second');
  }
  if (Math.abs(deltaSeconds) < 3600) {
    return rtf.format(Math.round(-deltaSeconds / 60), 'minute');
  }
  if (Math.abs(deltaSeconds) < 86400) {
    return rtf.format(Math.round(-deltaSeconds / 3600), 'hour');
  }
  if (Math.abs(deltaSeconds) < 86400 * 30) {
    return rtf.format(Math.round(-deltaSeconds / 86400), 'day');
  }
  if (Math.abs(deltaSeconds) < 86400 * 365) {
    return rtf.format(Math.round(-deltaSeconds / (86400 * 30)), 'month');
  }
  return rtf.format(Math.round(-deltaSeconds / (86400 * 365)), 'year');
}
const Timestamp: React.FC = () => {
  const { timestamp } = usePostcard();
  const time = new Date(timestamp);
  const relativeTimestamp = getRelativeTimeString(time);
  return <time className={styles.timestamp}>{relativeTimestamp}</time>;
};

const Content: React.FC = () => {
  const { content } = usePostcard();
  return <div className={styles.content}>{content}</div>;
};

const Embed: React.FC = () => {
  const { embed } = usePostcard();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (embed?.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      const isHLS = embed.url.includes('.m3u8');

      if (isHLS) {
        // Handle HLS streams
        import('hls.js')
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(embed.url);
              hls.attachMedia(video);

              // Cleanup on unmount
              return () => {
                hls.destroy();
              };
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              // Safari native HLS support
              video.src = embed.url;
            }
          })
          .catch((error) => {
            console.error('Failed to load HLS.js:', error);
            // Fallback: try to load the URL directly
            video.src = embed.url;
          });
      } else {
        // Regular video file
        video.src = embed.url;
      }
    }
  }, [embed]);

  if (!embed) return null;

  switch (embed.type) {
    case 'image':
      return (
        <Image
          src={embed.url}
          width={embed.aspectRatio.width}
          height={embed.aspectRatio.height}
          alt=""
          className={styles.image}
        />
      );
    case 'video':
      return (
        <video
          ref={videoRef}
          controls
          className={styles.video}
          width={embed.aspectRatio.width}
          height={embed.aspectRatio.height}
          preload="metadata"
        />
      );
    case 'audio':
      return <audio src={embed.url} controls className={styles.audio} />;
    default:
      return null;
  }
};
const Like: React.FC = () => {
  const { stats } = usePostcard();
  return (
    <button className={styles.stat}>
      <span>
        <Icon icon={faHeart} />
      </span>
      <span>{stats.likes}</span>
    </button>
  );
};

const Reply: React.FC = () => {
  const { stats } = usePostcard();
  return (
    <button className={styles.stat}>
      <span>
        <Icon icon={faComments} />
      </span>
      <span>{stats.replies}</span>
    </button>
  );
};

const Repost: React.FC = () => {
  const { stats } = usePostcard();
  return (
    <button className={styles.stat}>
      <span>
        <Icon icon={faRetweet} />
      </span>
      <span>{stats.reposts}</span>
    </button>
  );
};

const ExternalLink: React.FC<{ link: string }> = ({ link }) => {
  return (
    <Link href={link} target="_blank" className={styles.stat}>
      <Icon icon={faExternalLink} />
      <span>View on Bluesky</span>
    </Link>
  );
};

Postcard.Header = Header;
Postcard.Body = Body;
Postcard.Footer = Footer;
Postcard.Stats = Stats;
Postcard.Author = Author;
Postcard.Timestamp = Timestamp;
Postcard.Content = Content;
Postcard.Embed = Embed;
Postcard.Like = Like;
Postcard.Reply = Reply;
Postcard.Repost = Repost;
Postcard.ExternalLink = ExternalLink;

export default Postcard;
