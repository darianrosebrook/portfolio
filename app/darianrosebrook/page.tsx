'use client';
import Image from 'next/image';
import styles from './page.module.scss';
import exampleBlueskyPosts from './example-bluesky-posts.json';
import Postcard from '@/components/Postcard/Postcard';
import Avatar from '@/components/Avatar';
import type {
  BlueskyPost,
  BlueskyEmbed,
  BlueskyVideoEmbed,
  BlueskyImageEmbed,
  BlueskyExternalEmbed,
} from '@/types/bluesky';
import Link from 'next/link';

interface ThreadedPost {
  post: BlueskyPost['post'];
  reply?: BlueskyPost['reply'];
  isReply: boolean;
  parentUri?: string;
}

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
        url: videoEmbed.playlist ?? videoEmbed.thumbnail,
        aspectRatio: videoEmbed.aspectRatio ?? { width: 16, height: 9 },
      };
    }
    case 'app.bsky.embed.images#view': {
      const imageEmbed = embed as BlueskyImageEmbed;
      // Handle images array - take the first image
      if (imageEmbed.images && imageEmbed.images.length > 0) {
        const firstImage = imageEmbed.images[0];
        return {
          type: 'image',
          url: firstImage.fullsize ?? firstImage.thumb,
          aspectRatio: firstImage.aspectRatio ?? { width: 4, height: 3 },
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
          url: externalEmbed.external.thumb,
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
          url: anyEmbed.playlist as string,
          aspectRatio: anyEmbed.aspectRatio ?? { width: 16, height: 9 },
        };
      }
      if (anyEmbed.thumbnail) {
        return {
          type: 'image',
          url: anyEmbed.thumbnail as string,
          aspectRatio: anyEmbed.aspectRatio ?? { width: 16, height: 9 },
        };
      }
      break;
    }
  }

  return undefined;
};

export default function Page() {
  try {
    const { profile, posts } = exampleBlueskyPosts;

    // Process posts to identify threaded conversations
    const processedPosts = posts.reduce((acc: ThreadedPost[], feedItem) => {
      if (!feedItem?.post) return acc;

      const isReply = !!feedItem.post.record.reply;
      const parentUri = isReply
        ? feedItem.post.record.reply?.parent?.uri
        : undefined;

      const threadedPost: ThreadedPost = {
        post: feedItem.post,
        reply: feedItem.reply,
        isReply,
        parentUri,
      };

      acc.push(threadedPost);
      return acc;
    }, []);
    const description = (
      <>
        <p className={styles.description}>
          I’m Darian Rosebrook, a Staff Design Technologist with a background
          that bridges branding, UX, and system-level design engineering across
          some of the world’s largest product ecosystems. My work focuses on
          improving the workflows between design and code—developing tooling,
          scalable design systems, and AI-augmented processes that enhance
          quality, accessibility, and consistency.
        </p>
        <p className={styles.description}>
          I’ve led high-impact initiatives at companies like Microsoft,
          Salesforce, Nike, eBay, Verizon, Venmo, and now Qualtrics, where I’m
          defining how technology, design, and automation converge to elevate
          product development. I care deeply about aligning internal values with
          external systems, and my current focus is on building intelligent,
          inclusive systems that empower cross-functional teams to do their best
          work.
        </p>
      </>
    );
    // Separate root posts and replies
    const rootPosts = processedPosts.filter((item) => !item.isReply);
    const replies = processedPosts.filter((item) => item.isReply);

    // Build threaded structure
    const threadsMap = new Map<string, ThreadedPost[]>();

    rootPosts.forEach((rootPost) => {
      threadsMap.set(rootPost.post.uri, [rootPost]);
    });

    replies.forEach((reply) => {
      if (reply.parentUri) {
        const thread = threadsMap.get(reply.parentUri);
        if (thread) {
          thread.push(reply);
        } else {
          // If parent not found, treat as root for now
          threadsMap.set(reply.post.uri, [reply]);
        }
      }
    });

    return (
      <div className={styles.main}>
        <section className={styles.profileHeader}>
          {profile.banner && (
            <div
              className={styles.banner}
              style={{ backgroundImage: `url("/cover.jpeg")` }}
            />
          )}

          <div className={styles.profileContent}>
            {profile.avatar && (
              <Image
                src={`/darian-profile.webp`}
                alt={`${profile.handle}'s avatar`}
                width={120}
                height={120}
                className={styles.avatar}
              />
            )}

            <div className={styles.profileInfo}>
              <h1 className={styles.displayName}>{profile.displayName}</h1>
              <p className={styles.handle}>@{profile.handle}</p>
              {description}

              <div className={styles.stats}>
                <span>
                  <strong>{profile.postsCount}</strong> posts
                </span>
                <span>
                  <strong>{profile.followersCount}</strong> followers
                </span>
                <span>
                  <strong>{profile.followsCount}</strong> following
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.postsSection}>
          <h2 className={styles.postsTitle}>Recent Posts</h2>

          {posts.length === 0 ? (
            <p className={styles.noPosts}>No posts found</p>
          ) : (
            <div>
              {Array.from(threadsMap.values()).map((thread, threadIndex) => (
                <div key={threadIndex} className={styles.thread}>
                  {thread.map((threadedPost, postIndex) => {
                    const { post, isReply } = threadedPost;
                    const transformedEmbed = transformEmbed(post.embed);

                    return (
                      <div
                        key={post.uri ?? `${threadIndex}-${postIndex}`}
                        className={`${styles.postWrapper} ${isReply ? styles.replyPost : styles.rootPost}`}
                      >
                        {isReply && <div className={styles.threadLine} />}
                        <Link
                          href={`https://bsky.app/profile/darianrosebrook.com/post/${post.uri.split('/').pop()}`}
                          target="_blank"
                        >
                          <Postcard
                            postId={post.uri ?? `${threadIndex}-${postIndex}`}
                            author={{
                              name: post.author.displayName,
                              handle: post.author.handle,
                              avatar: post.author.avatar,
                            }}
                            timestamp={post.indexedAt}
                            content={post.record.text}
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
                                name={post.author.displayName}
                                src={post.author.avatar}
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
                              </Postcard.Stats>
                            </Postcard.Footer>
                          </Postcard>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  } catch (error) {
    console.error('Error loading Bluesky profile:', error);

    return (
      <main className={styles.errorContainer}>
        <h1>Darian Rosebrook</h1>
        <p>Unable to load Bluesky profile. Please try again later.</p>
      </main>
    );
  }
}
