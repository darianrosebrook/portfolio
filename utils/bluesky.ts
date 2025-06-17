import { AtpAgent } from '@atproto/api';

/**
 * Bluesky API client configured for public access
 * This client connects to the AppView which doesn't require authentication
 */
export const agent = new AtpAgent({
  // This is the AppView URL - no authentication required
  service: 'https://public.api.bsky.app',
});

/**
 * The Bluesky handle for darianrosebrook.com
 */
export const BLUESKY_HANDLE = 'darianrosebrook.com';

/**
 * Type for Bluesky post data
 */
export interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName: string;
    avatar: string;
  };
  record: {
    text: string;
    createdAt: string;
    langs: string[];
    embed?: {
      $type: string;
      [key: string]: unknown;
    };
    reply?: {
      parent?: { uri: string };
      root?: { uri: string };
    };
  };
  embed?: {
    $type: string;
    [key: string]: unknown;
  };
  replyCount: number;
  repostCount: number;
  likeCount: number;
  quoteCount: number;
  indexedAt: string;
  labels: string[];
  reply?: {
    root?: BlueskyPost;
    parent?: BlueskyPost;
  };
}

/**
 * Interface for threaded post structure
 */
export interface ThreadedPost {
  post: BlueskyPost;
  reply?: BlueskyPost['reply'];
  isReply: boolean;
  parentUri?: string;
}

/**
 * Fetches Bluesky profile and feed data for a given handle
 * @returns Promise containing profile and processed threaded posts
 */
export async function fetchBlueskyData() {
  if (!agent) {
    throw new Error('Bluesky agent not configured');
  }

  const [profileResponse, feedResponse] = await Promise.all([
    agent.getProfile({ actor: BLUESKY_HANDLE }),
    agent.getAuthorFeed({ actor: BLUESKY_HANDLE, limit: 50 }),
  ]);

  const profile = profileResponse?.data;
  const feedItems = feedResponse?.data?.feed ?? [];

  if (!profile) {
    throw new Error('No profile data found');
  }

  // Process feed items to create threaded posts
  const processedPosts = feedItems.reduce((acc: ThreadedPost[], feedItem) => {
    if (!feedItem?.post) return acc;

    const post = feedItem.post as unknown as BlueskyPost;
    const isReply = !!post.record.reply;
    const parentUri = isReply ? post.record.reply?.parent?.uri : undefined;

    const threadedPost: ThreadedPost = {
      post,
      reply: feedItem.reply
        ? (feedItem.reply as unknown as BlueskyPost['reply'])
        : undefined,
      isReply,
      parentUri,
    };

    acc.push(threadedPost);
    return acc;
  }, []);

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

  return {
    profile: {
      displayName: profile.displayName ?? profile.handle ?? 'Darian Rosebrook',
      handle: profile.handle ?? BLUESKY_HANDLE,
      description: profile.description ?? '',
      avatar: profile.avatar ?? '',
      banner: profile.banner ?? '',
      followersCount: profile.followersCount ?? 0,
      followsCount: profile.followsCount ?? 0,
      postsCount: profile.postsCount ?? 0,
    },
    threads: Array.from(threadsMap.values()),
    processedPosts,
  };
}
