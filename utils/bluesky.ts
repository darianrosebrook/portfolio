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
 * Fetches Bluesky profile and feed data for a given handle
 * @returns Promise containing profile and feed data
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
  const posts = feedResponse?.data?.feed ?? [];

  if (!profile) {
    throw new Error('No profile data found');
  }

  // Group posts by thread
  const threadMap = new Map<string, BlueskyPost[]>();
  const processedPosts = new Set<string>();

  posts.forEach(({ post }) => {
    const postData = post as unknown as BlueskyPost;

    // Skip if we've already processed this post
    if (processedPosts.has(postData.uri)) {
      return;
    }

    // If this is a reply, add it to the thread
    if (postData.reply?.root) {
      const rootUri = postData.reply.root.uri;
      const thread = threadMap.get(rootUri) ?? [];
      thread.push(postData);
      threadMap.set(rootUri, thread);
    } else {
      // This is a root post, start a new thread
      threadMap.set(postData.uri, [postData]);
    }

    processedPosts.add(postData.uri);
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
    posts: Array.from(threadMap.values()),
  };
}
