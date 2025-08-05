'use client';

import Postcard from '@/components/Postcard';
import Avatar from '@/components/Avatar';
import styles from './page.module.scss';
import type {
  BlueskyEmbed,
  BlueskyVideoEmbed,
  BlueskyImageEmbed,
  BlueskyExternalEmbed,
} from '@/types/bluesky';

const transformEmbed = (
  embed?: BlueskyEmbed
):
  | {
      type: 'image' | 'video' | 'audio';
      url: string;
      aspectRatio: { width: number; height: number };
    }
  | undefined => {
  if (!embed) return undefined;

  switch (embed.$type) {
    case 'app.bsky.embed.video#view': {
      const videoEmbed = embed as BlueskyVideoEmbed;
      return {
        type: 'video',
        url: String(videoEmbed.playlist ?? videoEmbed.thumbnail ?? ''),
        aspectRatio: {
          width: Number(videoEmbed.aspectRatio?.width ?? 16),
          height: Number(videoEmbed.aspectRatio?.height ?? 9),
        },
      };
    }
    case 'app.bsky.embed.images#view': {
      const imageEmbed = embed as BlueskyImageEmbed;
      // Handle images array - take the first image
      if (imageEmbed.images && imageEmbed.images.length > 0) {
        const firstImage = imageEmbed.images[0];
        return {
          type: 'image',
          url: String(firstImage.fullsize ?? firstImage.thumb ?? ''),
          aspectRatio: {
            width: Number(firstImage.aspectRatio?.width ?? 4),
            height: Number(firstImage.aspectRatio?.height ?? 3),
          },
        };
      }
      break;
    }
    case 'app.bsky.embed.external#view': {
      const externalEmbed = embed as BlueskyExternalEmbed;
      // Handle external links with preview images
      if (externalEmbed.external?.thumb) {
        return {
          type: 'image',
          url: String(externalEmbed.external.thumb),
          aspectRatio: { width: 16, height: 9 }, // Default aspect ratio for link previews
        };
      }
      break;
    }
    default: {
      // Try to infer from available data
      const anyEmbed = embed as BlueskyVideoEmbed;
      if (anyEmbed.playlist) {
        return {
          type: 'video',
          url: String(anyEmbed.playlist),
          aspectRatio: {
            width: Number(anyEmbed.aspectRatio?.width ?? 16),
            height: Number(anyEmbed.aspectRatio?.height ?? 9),
          },
        };
      }
      if (anyEmbed.thumbnail) {
        return {
          type: 'image',
          url: String(anyEmbed.thumbnail),
          aspectRatio: {
            width: Number(anyEmbed.aspectRatio?.width ?? 16),
            height: Number(anyEmbed.aspectRatio?.height ?? 9),
          },
        };
      }
      break;
    }
  }

  return undefined;
};

interface PostcardThreadListProps {
  threads: Array<
    Array<{
      post: {
        uri: string;
        cid: string;
        author: {
          displayName: string;
          handle: string;
          avatar: string;
        };
        record: {
          text: string;
        };
        embed?: BlueskyEmbed;
        replyCount?: number;
        repostCount?: number;
        likeCount?: number;
        quoteCount?: number;
        indexedAt: string;
        labels?: unknown[];
      };
      reply?: unknown;
      isReply: boolean;
      parentUri?: string;
    } | null>
  >;
}

export default function PostcardThreadList({
  threads,
}: PostcardThreadListProps) {
  return (
    <>
      {threads.map((thread, threadIndex) => (
        <div key={threadIndex} className={styles.thread}>
          {thread.map((threadedPost, postIndex) => {
            if (!threadedPost) return null;
            const { post, isReply } = threadedPost;

            // Safety checks for required post data
            if (!post || !post.author || !post.record) {
              console.warn('Skipping post with missing data:', post);
              return null;
            }

            const transformedEmbed = transformEmbed(post.embed);

            return (
              <div
                key={post.uri ?? postIndex}
                className={`${styles.postWrapper} ${isReply ? styles.replyPost : styles.rootPost}`}
              >
                {isReply && <div className={styles.threadLine} />}
                <Postcard
                  postId={post.uri ?? postIndex.toString()}
                  author={{
                    name: post.author.displayName ?? 'Unknown',
                    handle: post.author.handle ?? 'unknown',
                    avatar: post.author.avatar ?? '',
                  }}
                  timestamp={post.indexedAt ?? new Date().toISOString()}
                  content={post.record.text ?? ''}
                  embed={transformedEmbed}
                  stats={{
                    likes: post.likeCount ?? 0,
                    replies: post.replyCount ?? 0,
                    reposts: post.repostCount ?? 0,
                  }}
                >
                  <Postcard.Header>
                    <Avatar
                      size="large"
                      name={post.author.displayName ?? 'Unknown'}
                      src={post.author.avatar ?? ''}
                    />
                    <Postcard.Author />
                    <Postcard.Timestamp />
                  </Postcard.Header>
                  <Postcard.Body>
                    <Postcard.Content />
                    {transformedEmbed && <Postcard.Embed />}
                  </Postcard.Body>
                  <Postcard.Footer>
                    <Postcard.Stats>
                      <Postcard.Like />
                      <Postcard.Reply />
                      <Postcard.Repost />
                      <Postcard.ExternalLink
                        link={`https://bsky.app/profile/darianrosebrook.com/post/${post.uri.split('/').pop()}`}
                      />
                    </Postcard.Stats>
                  </Postcard.Footer>
                </Postcard>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
