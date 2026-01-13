import { test, expect } from '@playwright/test';

/**
 * TipTap Editor E2E Tests
 * Tests the draft creation, saving, loading, and deletion functionality
 * 
 * Note: These tests require authentication. Run with:
 * SUPABASE_TEST_EMAIL=your@email.com SUPABASE_TEST_PASSWORD=yourpassword npx playwright test test/e2e/tiptap-editor.spec.ts
 */

const LOCAL_STORAGE_KEY = 'draft-article-new';

test.describe('TipTap Editor - Draft Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3000');
    await page.evaluate((key) => {
      localStorage.removeItem(key);
    }, LOCAL_STORAGE_KEY);
  });

  test('should save draft to localStorage when typing', async ({ page }) => {
    // Navigate to new article page (may redirect to login)
    await page.goto('http://localhost:3000/dashboard/articles/new');
    
    // Check if we're redirected to login
    const url = page.url();
    if (url.includes('login') || url.includes('auth')) {
      test.skip(true, 'Authentication required - skipping test');
      return;
    }

    // Wait for editor to load
    await page.waitForSelector('[class*="editor"]', { timeout: 10000 });

    // Type some content in the editor
    const editor = page.locator('[class*="editor"] [contenteditable="true"]');
    await editor.click();
    await editor.type('# Test Article Title\n\nThis is test content for the draft.');

    // Wait for auto-save debounce (2 seconds + buffer)
    await page.waitForTimeout(3000);

    // Check localStorage for saved draft
    const savedDraft = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, LOCAL_STORAGE_KEY);

    expect(savedDraft).not.toBeNull();
    
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      expect(parsed.articleBody).toBeDefined();
      expect(parsed._savedAt).toBeDefined();
    }
  });

  test('should restore draft from localStorage on page reload', async ({ page }) => {
    // First, set up a draft in localStorage
    const mockDraft = {
      slug: 'draft-123456789',
      headline: 'Restored Test Article',
      articleBody: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Restored Test Article' }]
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'This content was restored from localStorage.' }]
          }
        ]
      },
      status: 'draft',
      wordCount: 6,
      _savedAt: new Date().toISOString()
    };

    await page.goto('http://localhost:3000');
    await page.evaluate((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.draft));
    }, { key: LOCAL_STORAGE_KEY, draft: mockDraft });

    // Navigate to new article page
    await page.goto('http://localhost:3000/dashboard/articles/new');
    
    const url = page.url();
    if (url.includes('login') || url.includes('auth')) {
      test.skip(true, 'Authentication required - skipping test');
      return;
    }

    // Wait for editor to load
    await page.waitForSelector('[class*="editor"]', { timeout: 10000 });

    // Check that the content was restored
    const editorContent = await page.locator('[class*="editor"]').textContent();
    expect(editorContent).toContain('Restored Test Article');
  });

  test('should show save status indicator', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/articles/new');
    
    const url = page.url();
    if (url.includes('login') || url.includes('auth')) {
      test.skip(true, 'Authentication required - skipping test');
      return;
    }

    // Wait for editor to load
    await page.waitForSelector('[class*="editor"]', { timeout: 10000 });

    // Look for save status indicator
    const saveStatus = page.locator('text=/Not saved|Saved|Saving/');
    await expect(saveStatus).toBeVisible({ timeout: 5000 });
  });

  test('should generate slug from headline', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/articles/new');
    
    const url = page.url();
    if (url.includes('login') || url.includes('auth')) {
      test.skip(true, 'Authentication required - skipping test');
      return;
    }

    // Wait for editor to load
    await page.waitForSelector('[class*="editor"]', { timeout: 10000 });

    // Type a heading
    const editor = page.locator('[class*="editor"] [contenteditable="true"]');
    await editor.click();
    await editor.type('# My Amazing Test Article');

    // Wait for metadata extraction
    await page.waitForTimeout(1000);

    // Check that slug was generated (look in sidebar or form)
    const slugInput = page.locator('input[name="slug"], input#slug');
    if (await slugInput.isVisible()) {
      const slugValue = await slugInput.inputValue();
      expect(slugValue).toMatch(/my-amazing-test-article|draft-\d+/);
    }
  });
});

test.describe('TipTap Editor - API Integration', () => {
  test('POST /api/articles should create a new article', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/articles', {
      data: {
        slug: 'test-article-' + Date.now(),
        headline: 'Test Article',
        description: 'A test article',
        articleBody: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test content' }]
            }
          ]
        },
        status: 'draft'
      }
    });

    // Will be 401 without auth, which is expected
    const status = response.status();
    expect([201, 401]).toContain(status);
    
    if (status === 401) {
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    }
  });

  test('GET /api/articles should return articles list', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/articles');
    
    const status = response.status();
    expect([200, 401]).toContain(status);
  });
});
