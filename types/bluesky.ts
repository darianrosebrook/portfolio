/**
 * Bluesky profile data structure
 */
export interface BlueskyProfile {
  did?: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
  createdAt?: string;
}

/**
 * Bluesky author data structure
 */
export interface BlueskyAuthor {
  did: string;
  handle: string;
  displayName: string;
  avatar: string;
  associated?: {
    chat: {
      allowIncoming: string;
    };
  };
  labels: unknown[];
  createdAt: string;
}

/**
 * Bluesky embed structures
 */
export interface BlueskyEmbed {
  $type: string;
  [key: string]: unknown;
}

export interface BlueskyVideoEmbed extends BlueskyEmbed {
  $type: 'app.bsky.embed.video#view';
  cid: string;
  playlist: string;
  thumbnail: string;
  alt?: string;
  aspectRatio?: {
    height: number;
    width: number;
  };
}

export interface BlueskyImageEmbed extends BlueskyEmbed {
  $type: 'app.bsky.embed.images#view';
  images: Array<{
    thumb: string;
    fullsize: string;
    alt?: string;
    aspectRatio?: {
      height: number;
      width: number;
    };
  }>;
}

export interface BlueskyExternalEmbed extends BlueskyEmbed {
  $type: 'app.bsky.embed.external#view';
  external: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
}

/**
 * Bluesky post record structure
 */
export interface BlueskyPostRecord {
  $type: string;
  createdAt: string;
  langs?: string[];
  text: string;
  reply?: {
    parent: {
      cid: string;
      uri: string;
    };
    root: {
      cid: string;
      uri: string;
    };
  };
  embed?: unknown;
  facets?: unknown[];
}

/**
 * Bluesky post data structure
 */
export interface BlueskyPost {
  post: {
    uri: string;
    cid: string;
    author: BlueskyAuthor;
    record: BlueskyPostRecord;
    replyCount?: number;
    repostCount?: number;
    likeCount?: number;
    quoteCount?: number;
    indexedAt: string;
    labels: unknown[];
    embed?:
      | BlueskyVideoEmbed
      | BlueskyImageEmbed
      | BlueskyExternalEmbed
      | BlueskyEmbed;
  };
  reply?: {
    root: {
      uri: string;
      cid: string;
      author: BlueskyAuthor;
      record: BlueskyPostRecord;
      replyCount?: number;
      repostCount?: number;
      likeCount?: number;
      quoteCount?: number;
      indexedAt: string;
      labels: unknown[];
      $type: string;
    };
    parent: {
      uri: string;
      cid: string;
      author: BlueskyAuthor;
      record: BlueskyPostRecord;
      replyCount?: number;
      repostCount?: number;
      likeCount?: number;
      quoteCount?: number;
      indexedAt: string;
      labels: unknown[];
      $type: string;
    };
  };
}

/**
 * Feed response structure
 */
export interface BlueskyFeedResponse {
  profile: BlueskyProfile;
  posts: BlueskyPost[];
  cursor?: string;
}
