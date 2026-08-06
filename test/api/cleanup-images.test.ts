import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as CleanupImagesAPI from '@/app/api/cleanup-images/route';

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
    process.env.ADMIN_USER_IDS = 'admin-123';
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.ADMIN_USER_IDS;
  });

  describe('POST /api/cleanup-images', () => {
    it('should cleanup orphaned images successfully for admins', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockCleanupOrphanedImages.mockResolvedValue(undefined);

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
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

    it('should return 403 for authenticated non-admins', async () => {
      process.env.ADMIN_USER_IDS = 'someone-else';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const response = await CleanupImagesAPI.POST();
      const responseData = await response.json();

      expect(response.status).toBe(403);
      expect(responseData.error).toBe('Forbidden');
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
  });

  describe('GET /api/cleanup-images', () => {
    it('should return orphaned image statistics for admins', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFromCalls = [
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 2 }),
          }),
        },
        {
          select: vi.fn().mockResolvedValue({ count: 10 }),
        },
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
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const response = await CleanupImagesAPI.GET();
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
    });
  });
});
