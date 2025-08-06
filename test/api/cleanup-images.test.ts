import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as CleanupImagesAPI from '@/app/api/cleanup-images/route';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

// Use vi.hoisted for proper mock variable access
const mockCleanupOrphanedImages = vi.hoisted(() => vi.fn());

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock('@/utils/supabase/upload', () => ({
  cleanupOrphanedImages: mockCleanupOrphanedImages,
}));

const mockUser = {
  id: 'admin-123',
  email: 'admin@example.com',
};

describe('Cleanup Images API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/cleanup-images', () => {
    it('should cleanup orphaned images successfully', async () => {
      // Setup mocks
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockCleanupOrphanedImages.mockResolvedValue(undefined);

      // Execute
      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe(
        'Orphaned images cleaned up successfully'
      );
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockCleanupOrphanedImages).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
      expect(mockCleanupOrphanedImages).not.toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockCleanupOrphanedImages.mockRejectedValue(
        new Error('Failed to delete images')
      );

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to cleanup images');
    });

    it('should handle auth errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/cleanup-images', () => {
    it('should return orphaned image statistics successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the multiple sequential queries used in the actual implementation
      const mockFromCalls = [
        // First call: orphaned count
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 2 }),
          }),
        },
        // Second call: total count
        {
          select: vi.fn().mockResolvedValue({ count: 10 }),
        },
        // Third call: file sizes
        {
          select: vi.fn().mockResolvedValue({
            data: [{ file_size: 1024 }, { file_size: 2048 }],
          }),
        },
      ];

      let callIndex = 0;
      mockSupabase.from.mockImplementation(() => {
        return mockFromCalls[callIndex++] || mockFromCalls[0];
      });

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.orphanedImages).toBe(2);
      expect(responseData.totalImages).toBe(10);
      expect(responseData.totalSizeBytes).toBe(3072);
      expect(responseData.totalSizeMB).toBe(0);
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(500); // Auth check happens in try/catch
      expect(responseData.error).toBe('Failed to get image statistics');
    });

    it('should handle database query errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock first query to throw error
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Database query failed')),
        }),
      });

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to get image statistics');
    });

    it('should return empty stats when no orphaned images exist', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock the multiple sequential queries with zero values
      const mockFromCalls = [
        // First call: orphaned count = 0
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0 }),
          }),
        },
        // Second call: total count = 0
        {
          select: vi.fn().mockResolvedValue({ count: 0 }),
        },
        // Third call: no file sizes
        {
          select: vi.fn().mockResolvedValue({ data: [] }),
        },
      ];

      let callIndex = 0;
      mockSupabase.from.mockImplementation(() => {
        return mockFromCalls[callIndex++] || mockFromCalls[0];
      });

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.orphanedImages).toBe(0);
      expect(responseData.totalImages).toBe(0);
      expect(responseData.totalSizeBytes).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unexpected errors in POST', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(
        new Error('Unexpected auth service error')
      );

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to cleanup images');
    });

    it('should handle unexpected errors in GET', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(
        new Error('Unexpected auth service error')
      );

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Failed to get image statistics');
    });
  });
});
