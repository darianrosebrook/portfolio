import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as ArticlesAPI from '@/app/api/articles/route';
import * as ArticleSlugAPI from '@/app/api/articles/[slug]/route';
import type { ZodSafeParseResult } from 'zod';
import type { Article } from '@/types';
import {
  createArticleSchema,
  updateArticleSchema,
} from '@/utils/schemas/article.schema';

type RouteContext = { params: Promise<{ slug: string }> };

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
};

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock schemas
vi.mock('@/utils/schemas/article.schema', () => ({
  createArticleSchema: {
    safeParse: vi.fn(),
  },
  updateArticleSchema: {
    safeParse: vi.fn(),
  },
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockArticle: Article = {
  id: 1,
  slug: 'test-article',
  headline: 'Test Article',
  description: 'Test description',
  status: 'draft',
  author: 'user-123',
  editor: 'user-123',
  articleBody: { type: 'doc', content: [] },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  alternativeHeadline: null,
  articleSection: null,
  image: null,
  index: null,
  keywords: null,
  published_at: null,
  wordCount: null,
};

describe('Articles API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/articles', () => {
    it('should create article successfully with valid auth and data', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createArticleSchema.safeParse as any).mockReturnValue({
        success: true,
        data: mockArticle,
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [mockArticle],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      });

      // Create request
      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      // Execute
      const response = await ArticlesAPI.POST(request);
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(201);
      expect(responseData).toEqual([mockArticle]);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(createArticleSchema.safeParse).toHaveBeenCalledWith(mockArticle);
      expect(mockInsert).toHaveBeenCalledWith([
        {
          ...mockArticle,
          author: mockUser.id,
          editor: mockUser.id,
        },
      ]);
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      const response = await ArticlesAPI.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid article data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createArticleSchema.safeParse as any).mockReturnValue({
        success: false,
        error: {
          issues: [{ message: 'Invalid slug format' }],
        },
      });

      const invalidArticle = { ...mockArticle, slug: 'Invalid Slug!' };
      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidArticle),
      });

      const response = await ArticlesAPI.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (createArticleSchema.safeParse as any).mockReturnValue({
        success: true,
        data: mockArticle,
      } as ZodSafeParseResult<Article>);

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      });

      const request = new Request('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      const response = await ArticlesAPI.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/articles', () => {
    it('should return user articles successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [mockArticle],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      });

      const response = await ArticlesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual([mockArticle]);
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const response = await ArticlesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      });

      const response = await ArticlesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Query failed');
    });
  });

  describe('GET /api/articles/[slug]', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    it('should return article by slug successfully', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockArticle,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        delete: vi.fn(),
        insert: vi.fn(),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article'
      );
      const response = await ArticleSlugAPI.GET(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockArticle);
    });

    it('should handle non-existent articles', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'No rows returned' },
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: vi.fn(),
        delete: vi.fn(),
        insert: vi.fn(),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/non-existent'
      );
      const response = await ArticleSlugAPI.GET(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('No rows returned');
    });
  });

  describe('PUT /api/articles/[slug]', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    it('should update article successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (updateArticleSchema.safeParse as any).mockReturnValue({
        success: true,
        data: { headline: 'Updated Title' },
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ ...mockArticle, headline: 'Updated Title' }],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        select: vi.fn(),
        delete: vi.fn(),
        insert: vi.fn(),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headline: 'Updated Title' }),
        }
      );

      const response = await ArticleSlugAPI.PUT(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData[0].headline).toBe('Updated Title');
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headline: 'Updated Title' }),
        }
      );

      const response = await ArticleSlugAPI.PUT(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should validate update data', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (updateArticleSchema.safeParse as any).mockReturnValue({
        success: false,
        error: {
          issues: [{ message: 'Invalid update data' }],
        },
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' }),
        }
      );

      const response = await ArticleSlugAPI.PUT(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBeDefined();
    });
  });

  describe('DELETE /api/articles/[slug]', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    it('should delete article successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        select: vi.fn(),
        update: vi.fn(),
        insert: vi.fn(),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'DELETE',
        }
      );

      const response = await ArticleSlugAPI.DELETE(request, mockContext);

      expect(response.status).toBe(204);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'DELETE',
        }
      );

      const response = await ArticleSlugAPI.DELETE(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should handle database errors during deletion', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        select: vi.fn(),
        update: vi.fn(),
        insert: vi.fn(),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'DELETE',
        }
      );

      const response = await ArticleSlugAPI.DELETE(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Delete failed');
    });
  });
});
