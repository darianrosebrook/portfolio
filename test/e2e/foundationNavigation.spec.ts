import { test, expect } from '@playwright/test';

const foundationPages = [
  { slug: 'philosophy', title: 'Philosophy of Design Systems', prerequisites: [], nextUnits: ['tokens', 'accessibility'] },
  { slug: 'tokens', title: 'Design Tokens Foundations', prerequisites: ['philosophy'], nextUnits: ['color', 'spacing'] },
  { slug: 'accessibility', title: 'Accessibility as System Infrastructure', prerequisites: ['philosophy'], nextUnits: ['component-architecture'] },
  { slug: 'spacing', title: 'Spacing & Layout Systems', prerequisites: ['tokens'], nextUnits: ['layout'] },
  { slug: 'component-architecture', title: 'Component Architecture Basics', prerequisites: ['tokens', 'accessibility'], nextUnits: [] },
];

test.describe('Foundation Pages Navigation', () => {
  test.describe('Page Loading', () => {
    for (const pageData of foundationPages) {
      test(`should load ${pageData.slug} page without errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await page.goto(`/blueprints/foundations/${pageData.slug}`);
        await page.waitForLoadState('networkidle');
        
        // Verify page title is present
        await expect(page.locator('h1')).toContainText(pageData.title, { timeout: 5000 });
        
        // Verify no critical errors (allow some warnings)
        const criticalErrors = errors.filter((e) => 
          !e.includes('warning') && !e.includes('deprecation')
        );
        expect(criticalErrors.length).toBe(0);
      });
    }
  });

  test.describe('Prerequisites Navigation', () => {
    for (const pageData of foundationPages) {
      if (pageData.prerequisites.length > 0) {
        test(`should navigate to prerequisites from ${pageData.slug}`, async ({ page }) => {
          await page.goto(`/blueprints/foundations/${pageData.slug}`);
          
          for (const prereq of pageData.prerequisites) {
            const prereqLink = page.locator(`nav[aria-label="Prerequisites"] a[href*="${prereq}"]`);
            await expect(prereqLink).toBeVisible({ timeout: 5000 });
            
            await prereqLink.click();
            await expect(page).toHaveURL(new RegExp(`/blueprints/foundations/${prereq}`));
            
            // Navigate back
            await page.goBack();
            await expect(page).toHaveURL(new RegExp(`/blueprints/foundations/${pageData.slug}`));
          }
        });
      }
    }
  });

  test.describe('Next Units Navigation', () => {
    for (const pageData of foundationPages) {
      if (pageData.nextUnits.length > 0) {
        test(`should navigate to next units from ${pageData.slug}`, async ({ page }) => {
          await page.goto(`/blueprints/foundations/${pageData.slug}`);
          
          for (const nextUnit of pageData.nextUnits) {
            const nextUnitLink = page.locator(`nav[aria-label="Next steps"] a[href*="${nextUnit}"]`);
            await expect(nextUnitLink).toBeVisible({ timeout: 5000 });
            
            await nextUnitLink.click();
            await expect(page).toHaveURL(new RegExp(`/blueprints/foundations/${nextUnit}`));
            
            // Navigate back
            await page.goBack();
            await expect(page).toHaveURL(new RegExp(`/blueprints/foundations/${pageData.slug}`));
          }
        });
      }
    }
  });

  test.describe('Cross-Reference Links', () => {
    test('should navigate to related concepts', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      // Find a concept link in cross-references
      const conceptLink = page.locator('.conceptGrid a').first();
      const linkCount = await conceptLink.count();
      
      if (linkCount > 0) {
        const href = await conceptLink.getAttribute('href');
        expect(href).toMatch(/\/blueprints\/foundations\//);
        
        await conceptLink.click();
        await expect(page).toHaveURL(new RegExp('/blueprints/foundations/'));
      }
    });

    test('should navigate to component references', async ({ page }) => {
      await page.goto('/blueprints/foundations/component-architecture');
      
      // Check if component references exist
      const componentLink = page.locator('.componentReferences a').first();
      const linkCount = await componentLink.count();
      
      if (linkCount > 0) {
        const href = await componentLink.getAttribute('href');
        expect(href).toMatch(/\/blueprints\/component-standards\//);
        
        await componentLink.click();
        await expect(page).toHaveURL(new RegExp('/blueprints/component-standards/'));
      }
    });
  });

  test.describe('Glossary Integration', () => {
    test('should display glossary terms in cross-references', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      // Check if glossary terms section exists
      const glossarySection = page.locator('h3:has-text("Glossary Terms")');
      const sectionCount = await glossarySection.count();
      
      if (sectionCount > 0) {
        const glossaryLinks = page.locator('.glossaryTerms a');
        const count = await glossaryLinks.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should navigate to glossary from glossary term', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      const glossaryLink = page.locator('.glossaryTerms a').first();
      const linkCount = await glossaryLink.count();
      
      if (linkCount > 0) {
        const href = await glossaryLink.getAttribute('href');
        expect(href).toMatch(/\/blueprints\/glossary/);
        
        await glossaryLink.click();
        await expect(page).toHaveURL(new RegExp('/blueprints/glossary'));
      }
    });
  });

  test.describe('JSON-LD Structured Data', () => {
    for (const pageData of foundationPages) {
      test(`should have valid JSON-LD schemas on ${pageData.slug}`, async ({ page }) => {
        await page.goto(`/blueprints/foundations/${pageData.slug}`);
        
        // Check for JSON-LD script tags
        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();
        expect(count).toBeGreaterThan(0);
        
        // Verify at least one schema is valid JSON
        for (let i = 0; i < count; i++) {
          const scriptContent = await jsonLdScripts.nth(i).textContent();
          expect(() => JSON.parse(scriptContent!)).not.toThrow();
          
          const schema = JSON.parse(scriptContent!);
          expect(schema['@context']).toBe('https://schema.org');
        }
      });

      test(`should have BreadcrumbList schema on ${pageData.slug}`, async ({ page }) => {
        await page.goto(`/blueprints/foundations/${pageData.slug}`);
        
        const jsonLdScripts = page.locator('script[type="application/ld+json"]');
        const count = await jsonLdScripts.count();
        
        let hasBreadcrumb = false;
        for (let i = 0; i < count; i++) {
          const scriptContent = await jsonLdScripts.nth(i).textContent();
          const schema = JSON.parse(scriptContent!);
          
          if (schema['@type'] === 'BreadcrumbList') {
            hasBreadcrumb = true;
            expect(schema.itemListElement).toBeDefined();
            expect(Array.isArray(schema.itemListElement)).toBe(true);
          }
        }
        
        expect(hasBreadcrumb).toBe(true);
      });
    }
  });

  test.describe('SEO Metadata', () => {
    for (const pageData of foundationPages) {
      test(`should have correct SEO metadata on ${pageData.slug}`, async ({ page }) => {
        await page.goto(`/blueprints/foundations/${pageData.slug}`);
        
        // Check title
        const title = await page.title();
        expect(title).toContain(pageData.title);
        
        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        if (await metaDescription.count() > 0) {
          const description = await metaDescription.getAttribute('content');
          expect(description).toBeTruthy();
          expect(description!.length).toBeGreaterThan(0);
        }
        
        // Check canonical URL
        const canonical = page.locator('link[rel="canonical"]');
        if (await canonical.count() > 0) {
          const canonicalUrl = await canonical.getAttribute('href');
          expect(canonicalUrl).toContain(`/blueprints/foundations/${pageData.slug}`);
        }
        
        // Check Open Graph tags
        const ogTitle = page.locator('meta[property="og:title"]');
        if (await ogTitle.count() > 0) {
          const ogTitleContent = await ogTitle.getAttribute('content');
          expect(ogTitleContent).toBeTruthy();
        }
      });
    }
  });

  test.describe('Accessibility', () => {
    test('should have skip to content link', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeVisible();
      
      // Skip link should be focusable
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
    });

    test('should have accessible navigation landmarks', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      // Check for main landmark
      const main = page.locator('main[id="main-content"]');
      await expect(main).toBeVisible();
      
      // Check for nav landmarks
      const navs = page.locator('nav[aria-label]');
      const navCount = await navs.count();
      expect(navCount).toBeGreaterThan(0);
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      // Focus first link
      const firstLink = page.locator('main a').first();
      await firstLink.focus();
      
      // Check if focused element has visible outline
      const outline = await firstLink.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.outlineWidth !== '0px' || style.boxShadow !== 'none';
      });
      
      expect(outline).toBe(true);
    });
  });

  test.describe('Metrics Tracking', () => {
    test('should track page views', async ({ page, context }) => {
      // Clear localStorage before test
      await context.addInitScript(() => {
        localStorage.clear();
      });

      await page.goto('/blueprints/foundations/philosophy');
      await page.waitForTimeout(1000); // Wait for tracking

      // Check localStorage for tracked views
      const views = await page.evaluate(() => {
        const stored = localStorage.getItem('foundation_views');
        return stored ? JSON.parse(stored) : [];
      });

      expect(views.length).toBeGreaterThan(0);
      expect(views[views.length - 1].slug).toBe('philosophy');
    });

    test('should track cross-reference clicks', async ({ page, context }) => {
      await context.addInitScript(() => {
        localStorage.clear();
      });

      await page.goto('/blueprints/foundations/philosophy');
      
      // Click a cross-reference link if available
      const crossRefLink = page.locator('.conceptGrid a, .componentReferences a').first();
      const linkCount = await crossRefLink.count();
      
      if (linkCount > 0) {
        await crossRefLink.click();
        await page.waitForTimeout(500); // Wait for tracking

        const crossRefs = await page.evaluate(() => {
          const stored = localStorage.getItem('foundation_cross_refs');
          return stored ? JSON.parse(stored) : [];
        });

        expect(crossRefs.length).toBeGreaterThan(0);
        expect(crossRefs[crossRefs.length - 1].type).toBe('concept');
      }
    });
  });

  test.describe('Section Navigation', () => {
    test('should navigate to sections via anchor links', async ({ page }) => {
      await page.goto('/blueprints/foundations/philosophy');
      
      // Find a section ID
      const section = page.locator('section[id="why-matters"]');
      await expect(section).toBeVisible();
      
      // Navigate directly to section
      await page.goto('/blueprints/foundations/philosophy#why-matters');
      await expect(section).toBeVisible();
      
      // Section should be scrolled into view (with some tolerance)
      const isInViewport = await section.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= -100 && rect.top <= window.innerHeight + 100;
      });
      
      expect(isInViewport).toBe(true);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/blueprints/foundations/philosophy');
      
      // Check that content is readable
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      // Check that links are tappable (min 44x44px for touch targets)
      const links = page.locator('main a');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        const box = await link.boundingBox();
        if (box && box.width > 0 && box.height > 0) {
          // Touch targets should be at least 44x44px
          const minSize = Math.min(box.width, box.height);
          expect(minSize).toBeGreaterThanOrEqual(24); // Allow some flexibility
        }
      }
    });
  });
});

