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

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

  describe('PATCH /api/articles/[slug] - Draft Save', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    const draftContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Draft content here' }],
        },
      ],
    };

    it('should save draft successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  ...mockArticle,
                  workingbody: draftContent,
                  workingheadline: 'Draft Headline',
                  workingdescription: 'Draft description',
                  workingimage: 'draft-image.jpg',
                  workingkeywords: 'draft, keywords',
                  workingarticlesection: 'Technology',
                  is_dirty: true,
                  working_modified_at: new Date().toISOString(),
                },
              ],
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
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: draftContent,
            workingHeadline: 'Draft Headline',
            workingDescription: 'Draft description',
            workingImage: 'draft-image.jpg',
            workingKeywords: 'draft, keywords',
            workingArticleSection: 'Technology',
          }),
        }
      );

      const response = await ArticleSlugAPI.PATCH(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData[0].workingbody).toEqual(draftContent);
      expect(responseData[0].workingheadline).toBe('Draft Headline');
      expect(responseData[0].is_dirty).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          workingbody: draftContent,
          workingheadline: 'Draft Headline',
          workingdescription: 'Draft description',
          workingimage: 'draft-image.jpg',
          workingkeywords: 'draft, keywords',
          workingarticlesection: 'Technology',
          is_dirty: true,
          working_modified_at: expect.any(String),
        })
      );
    });

    it('should return 401 for unauthenticated draft save requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: draftContent,
            workingHeadline: 'Draft Headline',
          }),
        }
      );

      const response = await ArticleSlugAPI.PATCH(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should handle database errors during draft save', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Draft save failed' },
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
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: draftContent,
            workingHeadline: 'Draft Headline',
          }),
        }
      );

      const response = await ArticleSlugAPI.PATCH(request, mockContext);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Draft save failed');
    });

    it('should return 404 when article not found or unauthorized', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [],
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
        'http://localhost:3000/api/articles/non-existent',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: draftContent,
            workingHeadline: 'Draft Headline',
          }),
        }
      );

      const nonExistentContext: RouteContext = {
        params: Promise.resolve({ slug: 'non-existent' }),
      };

      const response = await ArticleSlugAPI.PATCH(request, nonExistentContext);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Article not found or unauthorized');
    });
  });

  describe('GET /api/articles/[slug] - Reading Drafts', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    it('should return article with working draft when is_dirty is true', async () => {
      const articleWithDraft = {
        ...mockArticle,
        articleBody: { type: 'doc', content: [] }, // Published content
        headline: 'Published Headline',
        workingbody: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Draft content' }],
            },
          ],
        },
        workingheadline: 'Draft Headline',
        workingdescription: 'Draft description',
        is_dirty: true,
        working_modified_at: '2024-01-02T00:00:00Z',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: articleWithDraft,
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
      expect(responseData).toEqual(articleWithDraft);
      expect(responseData.is_dirty).toBe(true);
      expect(responseData.workingbody).toBeDefined();
      expect(responseData.workingheadline).toBe('Draft Headline');
    });

    it('should return article without working draft when is_dirty is false', async () => {
      const articleWithoutDraft = {
        ...mockArticle,
        articleBody: { type: 'doc', content: [] },
        headline: 'Published Headline',
        is_dirty: false,
        workingbody: null,
        workingheadline: null,
        workingdescription: null,
        working_modified_at: null,
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: articleWithoutDraft,
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
      expect(responseData).toEqual(articleWithoutDraft);
      expect(responseData.is_dirty).toBe(false);
      expect(responseData.workingbody).toBeNull();
    });
  });

  describe('Draft Save and Read Integration', () => {
    const mockContext: RouteContext = {
      params: Promise.resolve({ slug: 'test-article' }),
    };

    it('should save draft and then read it back correctly', async () => {
      const draftContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This is draft content from tiptap editor',
              },
            ],
          },
        ],
      };

      // First, save the draft
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const savedDraft = {
        ...mockArticle,
        workingbody: draftContent,
        workingheadline: 'Draft Headline from Editor',
        workingdescription: 'Draft description from editor',
        is_dirty: true,
        working_modified_at: new Date().toISOString(),
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [savedDraft],
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

      const saveRequest = new Request(
        'http://localhost:3000/api/articles/test-article',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: draftContent,
            workingHeadline: 'Draft Headline from Editor',
            workingDescription: 'Draft description from editor',
          }),
        }
      );

      const saveResponse = await ArticleSlugAPI.PATCH(saveRequest, mockContext);
      const saveResponseData = await saveResponse.json();

      expect(saveResponse.status).toBe(200);
      expect(saveResponseData[0].workingbody).toEqual(draftContent);
      expect(saveResponseData[0].is_dirty).toBe(true);

      // Then, read it back
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: savedDraft,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
        delete: vi.fn(),
        insert: vi.fn(),
      });

      const readRequest = new Request(
        'http://localhost:3000/api/articles/test-article'
      );
      const readResponse = await ArticleSlugAPI.GET(readRequest, mockContext);
      const readResponseData = await readResponse.json();

      expect(readResponse.status).toBe(200);
      expect(readResponseData.workingbody).toEqual(draftContent);
      expect(readResponseData.workingheadline).toBe(
        'Draft Headline from Editor'
      );
      expect(readResponseData.is_dirty).toBe(true);
    });
  });
});
