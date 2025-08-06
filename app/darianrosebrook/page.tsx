import Image from 'next/image';
import styles from './page.module.scss';

// Remove unused Bluesky types
// import type {
//   BlueskyEmbed,
//   BlueskyVideoEmbed,
//   BlueskyImageEmbed,
//   BlueskyExternalEmbed,
// } from '@/types/bluesky';

import { fetchBlueskyData } from '@/utils/bluesky';
import dynamic from 'next/dynamic';

const PostcardThreadList = dynamic(() => import('./PostcardThreadList.client'));

export default async function Page() {
  try {
    const { profile, posts } = await fetchBlueskyData();

    // Process each thread to properly structure the conversation
    const processedThreads = posts.map((thread) => {
      // Sort posts within each thread by timestamp to maintain conversation order
      const sortedThread = thread.sort((a, b) => {
        const timeA = new Date(a.indexedAt ?? '').getTime();
        const timeB = new Date(b.indexedAt ?? '').getTime();
        return timeA - timeB;
      });

      return sortedThread
        .map((feedItem) => {
          if (!feedItem) return null;

          const isReply = !!feedItem.reply;
          const parentUri = isReply ? feedItem.reply?.parent?.uri : undefined;

          return {
            post: {
              uri: String(feedItem.uri ?? ''),
              cid: String(feedItem.cid ?? ''),
              author: {
                displayName: String(feedItem.author?.displayName ?? ''),
                handle: String(feedItem.author?.handle ?? ''),
                avatar: String(feedItem.author?.avatar ?? ''),
              },
              record: {
                text: String(feedItem.record?.text ?? ''),
              },
              embed: feedItem.embed,
              replyCount: Number(feedItem.replyCount ?? 0),
              repostCount: Number(feedItem.repostCount ?? 0),
              likeCount: Number(feedItem.likeCount ?? 0),
              quoteCount: Number(feedItem.quoteCount ?? 0),
              indexedAt: String(feedItem.indexedAt ?? ''),
              labels: Array.isArray(feedItem.labels) ? feedItem.labels : [],
            },
            reply: feedItem.reply,
            isReply,
            parentUri: parentUri ? String(parentUri) : undefined,
          };
        })
        .filter(Boolean); // Remove null entries
    });

    const description = (
      <>
        <p className={styles.description}>
          I&apos;m Darian Rosebrook, a Staff Design Technologist with a
          background that bridges branding, UX, and system-level design
          engineering across some of the world&apos;s largest product
          ecosystems. My work focuses on improving the workflows between design
          and code—developing tooling, scalable design systems, and AI-augmented
          processes that enhance quality, accessibility, and consistency.
        </p>
        <p className={styles.description}>
          I&apos;ve led high-impact initiatives at companies like Microsoft,
          Salesforce, Nike, eBay, Verizon, Venmo, and now Qualtrics, where
          I&apos;m defining how technology, design, and automation converge to
          elevate product development. I care deeply about aligning internal
          values with external systems, and my current focus is on building
          intelligent, inclusive systems that empower cross-functional teams to
          do their best work.
        </p>
      </>
    );

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
                loading="lazy"
                sizes="120px"
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
            <PostcardThreadList threads={processedThreads} />
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
