import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as PublishAPI from '@/app/api/publish/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockArticle = {
  id: 1,
  slug: 'test-article',
  headline: 'Test Article',
  description: 'Test description',
  status: 'draft',
  articleBody: { type: 'doc', content: [] },
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
};

describe('Publish API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/publish', () => {
    it('should create article successfully with valid auth', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockInsert = vi.fn().mockResolvedValue({
        data: [{ ...mockArticle, author: mockUser.id }],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(),
        update: vi.fn(),
      });

      // Create request
      const request = new Request('http://localhost:3000/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      // Execute
      const response = await PublishAPI.POST(request);
      const responseData = await response.json();

      // Assertions
      expect(responseData.data).toEqual([
        { ...mockArticle, author: mockUser.id },
      ]);
      expect(responseData.error).toBeNull();
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith({
        ...mockArticle,
        author: mockUser.id,
      });
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      const response = await PublishAPI.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });

    it('should handle database insert errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed', code: 'UNIQUE_VIOLATION' },
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(),
        update: vi.fn(),
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      const response = await PublishAPI.POST(request);
      const responseData = await response.json();

      expect(responseData.error).toEqual({
        message: 'Insert failed',
        code: 'UNIQUE_VIOLATION',
      });
      expect(responseData.data).toBeNull();
    });

    it('should handle malformed JSON requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      // This should throw an error when trying to parse JSON
      await expect(PublishAPI.POST(request)).rejects.toThrow();
    });
  });

  describe('GET /api/publish', () => {
    it('should return all articles successfully', async () => {
      const mockArticles = [
        mockArticle,
        { ...mockArticle, id: 2, slug: 'another-article' },
      ];

      const mockSelect = vi.fn().mockResolvedValue({
        data: mockArticles,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
      });

      const response = await PublishAPI.GET();
      const responseData = await response.json();

      expect(responseData.data).toEqual(mockArticles);
      expect(responseData.error).toBeNull();
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should handle database select errors', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
      });

      const response = await PublishAPI.GET();
      const responseData = await response.json();

      expect(responseData.error).toEqual({
        message: 'Database connection failed',
      });
      expect(responseData.data).toBeNull();
    });

    it('should return empty array when no articles exist', async () => {
      const mockSelect = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
      });

      const response = await PublishAPI.GET();
      const responseData = await response.json();

      expect(responseData.data).toEqual([]);
      expect(responseData.error).toBeNull();
    });
  });

  describe('PUT /api/publish', () => {
    it('should update article successfully', async () => {
      const updatedData = { headline: 'Updated Title', status: 'published' };
      const updatePayload = { id: 1, ...updatedData };

      const mockEq = vi.fn().mockResolvedValue({
        data: [{ ...mockArticle, ...updatedData }],
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn(),
        select: vi.fn(),
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const response = await PublishAPI.PUT(request);
      const responseData = await response.json();

      expect(responseData.data).toEqual([{ ...mockArticle, ...updatedData }]);
      expect(responseData.error).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith({ id: 1, ...updatedData });
      expect(mockEq).toHaveBeenCalledWith('id', 1);
    });

    it('should handle update errors', async () => {
      const updatePayload = { id: 1, headline: 'Updated Title' };

      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Record not found', code: 'NOT_FOUND' },
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn(),
        select: vi.fn(),
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const response = await PublishAPI.PUT(request);
      const responseData = await response.json();

      expect(responseData.error).toEqual({
        message: 'Record not found',
        code: 'NOT_FOUND',
      });
      expect(responseData.data).toBeNull();
    });

    it('should handle malformed JSON in PUT requests', async () => {
      const request = new Request('http://localhost:3000/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      await expect(PublishAPI.PUT(request)).rejects.toThrow();
    });

    it('should pass all fields including id to update (current implementation behavior)', async () => {
      const updatePayload = {
        id: 1,
        headline: 'Updated Title',
        description: 'Updated description',
        extraField: 'should be included', // The current implementation includes all fields
      };

      // Current implementation doesn't filter out id or other fields
      const expectedUpdateData = updatePayload;

      const mockEq = vi.fn().mockResolvedValue({
        data: [{ ...mockArticle, ...expectedUpdateData }],
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn(),
        select: vi.fn(),
      });

      const request = new Request('http://localhost:3000/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      await PublishAPI.PUT(request);

      // The current implementation passes all fields including id
      expect(mockUpdate).toHaveBeenCalledWith(expectedUpdateData);
    });
  });

  describe('API Response Format Consistency', () => {
    it('should return consistent response format across all endpoints', async () => {
      // Test that all endpoints return { data, error } format

      // POST response
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const mockInsert = vi.fn().mockResolvedValue({
        data: [mockArticle],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn(),
        update: vi.fn(),
      });

      const postRequest = new Request('http://localhost:3000/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockArticle),
      });

      const postResponse = await PublishAPI.POST(postRequest);
      const postData = await postResponse.json();

      expect(postData).toHaveProperty('data');
      expect(postData).toHaveProperty('error');

      // GET response
      const mockSelect = vi.fn().mockResolvedValue({
        data: [mockArticle],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: vi.fn(),
        update: vi.fn(),
      });

      const getResponse = await PublishAPI.GET();
      const getData = await getResponse.json();

      expect(getData).toHaveProperty('data');
      expect(getData).toHaveProperty('error');

      // PUT response
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [mockArticle],
          error: null,
        }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn(),
        select: vi.fn(),
      });

      const putRequest = new Request('http://localhost:3000/api/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, headline: 'Test' }),
      });

      const putResponse = await PublishAPI.PUT(putRequest);
      const putData = await putResponse.json();

      expect(putData).toHaveProperty('data');
      expect(putData).toHaveProperty('error');
    });
  });
});
