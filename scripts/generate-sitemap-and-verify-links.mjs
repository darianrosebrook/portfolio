#!/usr/bin/env node

/**
 * Sitemap Generator & Link Verification Script
 *
 * This script:
 * 1. Generates a sitemap from all routes in the Next.js app
 * 2. Extracts all links from the codebase (href, Link components, router.push)
 * 3. Verifies each link points to a valid route
 * 4. Generates a report of missing/broken links
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const BASE_URL = 'https://darianrosebrook.com';
const IGNORE_PATTERNS = [
  /^#/, // Anchor links
  /^mailto:/, // Email links
  /^tel:/, // Phone links
  /^javascript:/, // JavaScript links
  /^http/, // External links (unless we want to verify those too)
  /^\/_next/, // Next.js internal
  /^\/api/, // API routes (optional - can be enabled)
  /^\/static/, // Static assets
  /^\$\{/, // Template literals (e.g., ${slug})
  /^\/\/[^/]/, // Protocol-relative URLs (//example.com)
  /^\/\/$/, // Double slash
  /^\/page\.tsx?$/, // File names
  /^\/link\d+$/, // Test file links
];

// Files/directories to ignore when extracting links
const IGNORE_FILES = [
  /\/test\//, // Test files
  /\.test\.(tsx?|jsx?)$/, // Test files
  /\.spec\.(tsx?|jsx?)$/, // Spec files
];

// Known dynamic routes and their patterns
const DYNAMIC_ROUTES = {
  '/articles/[slug]': { type: 'database', pattern: /^\/articles\/[^/]+$/ },
  '/work/[slug]': { type: 'database', pattern: /^\/work\/[^/]+$/ },
  '/dashboard/articles/[slug]': {
    type: 'database',
    pattern: /^\/dashboard\/articles\/[^/]+$/,
  },
  '/dashboard/case-studies/[slug]': {
    type: 'database',
    pattern: /^\/dashboard\/case-studies\/[^/]+$/,
  },
  '/blueprints/component-standards/[slug]': {
    type: 'static',
    pattern: /^\/blueprints\/component-standards\/[^/]+$/,
  },
  '/blueprints/component-standards/migrations/[migration]': {
    type: 'static',
    pattern: /^\/blueprints\/component-standards\/migrations\/[^/]+$/,
  },
  '/blueprints/foundations/tracks/[track]': {
    type: 'static',
    pattern:
      /^\/blueprints\/foundations\/tracks\/(designer|developer|cross-functional)$/,
  },
};

// Known route handlers (route.ts files) that can be linked to
const ROUTE_HANDLERS = ['/signout'];

/**
 * Convert file path to route path
 */
function pathToRoute(filePath) {
  const relativePath = relative(join(projectRoot, 'app'), filePath);
  let route =
    '/' +
    relativePath
      .replace(/\/page\.tsx?$/, '')
      .replace(/\/layout\.tsx?$/, '')
      .replace(/\/route\.ts$/, '')
      .replace(/\[([^\]]+)\]/g, '[$1]') // Keep dynamic segments
      .replace(/\\/g, '/');

  if (route === '/page' || route === '/') route = '/';
  if (route.endsWith('/') && route !== '/') route = route.slice(0, -1);
  if (route === '/page.tsx') route = '/';

  return route;
}

/**
 * Extract all page routes from the app directory
 */
async function extractRoutes(dir = 'app', routes = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // Skip hidden directories and node_modules
      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        await extractRoutes(fullPath, routes);
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        const route = pathToRoute(fullPath);
        // Skip invalid routes
        if (route && route !== '/page.tsx' && route !== '/page') {
          routes.push({
            path: route,
            file: fullPath,
            isDynamic: route.includes('['),
          });
        }
      }
    }
  } catch (error) {
    // Directory might not exist or permission issue
    console.warn(`Warning: Could not read directory ${dir}:`, error.message);
  }

  return routes;
}

/**
 * Check if a link is inside a code block (documentation example)
 */
function isInCodeBlock(content, linkIndex) {
  // Find the position of the link in the content
  const beforeLink = content.substring(0, linkIndex);

  // Count <pre> and <code> tags before the link
  const preTags = (beforeLink.match(/<pre[^>]*>/gi) || []).length;
  const codeTags = (beforeLink.match(/<code[^>]*>/gi) || []).length;
  const preCloseTags = (beforeLink.match(/<\/pre>/gi) || []).length;
  const codeCloseTags = (beforeLink.match(/<\/code>/gi) || []).length;

  // If there are unmatched <pre> or <code> tags, we're inside a code block
  return preTags > preCloseTags || codeTags > codeCloseTags;
}

/**
 * Extract links from a file
 */
async function extractLinksFromFile(filePath) {
  // Skip test files
  if (IGNORE_FILES.some((pattern) => pattern.test(filePath))) {
    return [];
  }

  const content = await readFile(filePath, 'utf-8').catch(() => '');
  const links = new Set();

  // Match href="..." or href='...' (but not template literals)
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const link = match[1];
    // Skip template literals and protocol-relative URLs
    if (!link.includes('${') && !link.startsWith('//')) {
      // Check if link is in a code block (documentation example)
      const linkIndex = match.index;
      if (!isInCodeBlock(content, linkIndex)) {
        links.add(link);
      }
    }
  }

  // Match Link href={...} or Link to={...} (but not template literals)
  const linkComponentRegex = /<Link[^>]+(?:href|to)=["']([^"']+)["']/g;
  while ((match = linkComponentRegex.exec(content)) !== null) {
    const link = match[1];
    if (!link.includes('${') && !link.startsWith('//')) {
      const linkIndex = match.index;
      if (!isInCodeBlock(content, linkIndex)) {
        links.add(link);
      }
    }
  }

  // Match router.push(...) or navigate(...) with string literals
  const routerPushRegex = /(?:router|useRouter)\.push\(["']([^"']+)["']\)/g;
  while ((match = routerPushRegex.exec(content)) !== null) {
    const link = match[1];
    if (!link.includes('${') && !link.startsWith('//')) {
      links.add(link);
    }
  }

  return Array.from(links);
}

/**
 * Recursively extract links from all files
 */
async function extractAllLinks(
  dir = 'app',
  fileExtensions = ['.tsx', '.ts', '.jsx', '.js'],
  links = []
) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other build directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await extractAllLinks(fullPath, fileExtensions, links);
        }
      } else {
        const ext = extname(entry.name);
        if (fileExtensions.includes(ext)) {
          const fileLinks = await extractLinksFromFile(fullPath);
          fileLinks.forEach((link) => {
            links.push({
              link,
              file: fullPath,
            });
          });
        }
      }
    }
  } catch (error) {
    // Ignore errors for directories we can't read
  }

  return links;
}

/**
 * Normalize a link to check against routes
 */
function normalizeLink(link) {
  // Remove anchor fragments
  let normalized = link.split('#')[0];

  // Remove query parameters
  normalized = normalized.split('?')[0];

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '') || '/';

  return normalized;
}

/**
 * Check if a link matches a route
 */
function linkMatchesRoute(link, routes) {
  const normalized = normalizeLink(link);

  // Check route handlers (route.ts files)
  if (ROUTE_HANDLERS.includes(normalized)) {
    return { valid: true, reason: 'route-handler' };
  }

  // Exact match
  if (routes.some((r) => r.path === normalized)) {
    return { valid: true, reason: 'exact' };
  }

  // Check dynamic routes
  for (const [dynamicRoute, config] of Object.entries(DYNAMIC_ROUTES)) {
    if (config.pattern.test(normalized)) {
      return { valid: true, reason: `dynamic:${dynamicRoute}` };
    }
  }

  // Check if it's a valid dynamic route pattern
  const routePatterns = routes
    .filter((r) => r.isDynamic)
    .map((r) => {
      const pattern = r.path.replace(/\[([^\]]+)\]/g, '[^/]+');
      return { pattern: new RegExp(`^${pattern}$`), original: r.path };
    });

  for (const { pattern, original } of routePatterns) {
    if (pattern.test(normalized)) {
      return { valid: true, reason: `pattern:${original}` };
    }
  }

  return { valid: false, reason: 'not found' };
}

/**
 * Check if link should be ignored
 */
function shouldIgnoreLink(link) {
  // Check ignore patterns
  if (IGNORE_PATTERNS.some((pattern) => pattern.test(link))) {
    return true;
  }

  // Check for template literals
  if (link.includes('${')) {
    return true;
  }

  // Check for protocol-relative URLs
  if (link.startsWith('//') && link.length > 2) {
    return true;
  }

  return false;
}

/**
 * Generate sitemap XML
 */
function generateSitemapXML(routes) {
  const urls = routes
    .filter((r) => !r.isDynamic || r.path.includes('[') === false)
    .map((r) => {
      const url = `${BASE_URL}${r.path}`;
      return `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/**
 * Generate report
 */
function generateReport(routes, links, brokenLinks) {
  const report = {
    generated: new Date().toISOString(),
    summary: {
      totalRoutes: routes.length,
      totalLinks: links.length,
      brokenLinks: brokenLinks.length,
      validLinks: links.length - brokenLinks.length,
    },
    routes: routes.map((r) => ({
      path: r.path,
      file: r.file,
      isDynamic: r.isDynamic,
    })),
    brokenLinks: brokenLinks.map((bl) => ({
      link: bl.link,
      normalized: normalizeLink(bl.link),
      file: bl.file,
      reason: bl.reason,
    })),
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Scanning project structure...\n');

  // Extract all routes
  const routes = await extractRoutes(join(projectRoot, 'app'));
  console.log(`✓ Found ${routes.length} routes`);

  // Extract all links
  console.log('🔗 Extracting links from codebase...\n');
  const allLinks = await extractAllLinks(join(projectRoot, 'app'));
  const allLinksUi = await extractAllLinks(join(projectRoot, 'ui'));
  const allLinksUtils = await extractAllLinks(join(projectRoot, 'utils'));
  const allLinksContext = await extractAllLinks(join(projectRoot, 'context'));

  const links = [
    ...allLinks,
    ...allLinksUi,
    ...allLinksUtils,
    ...allLinksContext,
  ];
  console.log(`✓ Found ${links.length} links`);

  // Verify links
  console.log('✅ Verifying links...\n');
  const brokenLinks = [];
  const seenLinks = new Set();

  for (const { link, file } of links) {
    // Skip ignored links
    if (shouldIgnoreLink(link)) continue;

    // Skip duplicates
    const key = `${link}::${file}`;
    if (seenLinks.has(key)) continue;
    seenLinks.add(key);

    // Only check internal links
    if (!link.startsWith('/')) continue;

    const match = linkMatchesRoute(link, routes);
    if (!match.valid) {
      brokenLinks.push({
        link,
        file,
        reason: match.reason,
      });
    }
  }

  // Generate sitemap
  const sitemap = generateSitemapXML(routes);
  const sitemapPath = join(projectRoot, 'public', 'sitemap.xml');
  await writeFile(sitemapPath, sitemap);
  console.log(`✓ Generated sitemap at public/sitemap.xml`);

  // Generate report
  const report = generateReport(routes, links, brokenLinks);
  const reportPath = join(projectRoot, 'link-verification-report.json');
  await writeFile(reportPath, report);
  console.log(`✓ Generated report at link-verification-report.json\n`);

  // Print summary
  console.log('📊 Summary:');
  console.log(`  Total Routes: ${routes.length}`);
  console.log(`  Total Links: ${links.length}`);
  console.log(`  Valid Links: ${links.length - brokenLinks.length}`);
  console.log(`  Broken Links: ${brokenLinks.length}\n`);

  if (brokenLinks.length > 0) {
    console.log('❌ Broken Links:');
    brokenLinks.slice(0, 20).forEach((bl) => {
      console.log(`  - ${bl.link} (in ${bl.file})`);
    });
    if (brokenLinks.length > 20) {
      console.log(`  ... and ${brokenLinks.length - 20} more`);
    }
    console.log('\n');
  }

  // Generate markdown report
  const mdReport = generateMarkdownReport(routes, brokenLinks);
  const mdReportPath = join(projectRoot, 'link-verification-report.md');
  await writeFile(mdReportPath, mdReport);
  console.log(`✓ Generated markdown report at link-verification-report.md\n`);

  process.exit(brokenLinks.length > 0 ? 1 : 0);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(routes, brokenLinks) {
  const dynamicRoutes = routes.filter((r) => r.isDynamic);
  const staticRoutes = routes.filter((r) => !r.isDynamic);

  return `# Link Verification Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Routes**: ${routes.length}
  - Static Routes: ${staticRoutes.length}
  - Dynamic Routes: ${dynamicRoutes.length}
- **Broken Links**: ${brokenLinks.length}

## Routes

### Static Routes (${staticRoutes.length})

${staticRoutes.map((r) => `- \`${r.path}\` - \`${r.file}\``).join('\n')}

### Dynamic Routes (${dynamicRoutes.length})

${dynamicRoutes.map((r) => `- \`${r.path}\` - \`${r.file}\``).join('\n')}

## Broken Links

${
  brokenLinks.length === 0
    ? '✅ No broken links found!'
    : brokenLinks
        .map(
          (bl) => `### \`${bl.link}\`

- **File**: \`${bl.file}\`
- **Normalized**: \`${normalizeLink(bl.link)}\`
- **Reason**: ${bl.reason}

`
        )
        .join('\n')
}

## Known Dynamic Route Patterns

${Object.entries(DYNAMIC_ROUTES)
  .map(
    ([route, config]) =>
      `- \`${route}\` (${config.type}) - Pattern: \`${config.pattern}\``
  )
  .join('\n')}

## Known Route Handlers

${ROUTE_HANDLERS.map((route) => `- \`${route}\` (route.ts handler)`).join('\n')}

## Next Steps

1. Review broken links above
2. Create missing routes or fix incorrect links
3. For dynamic routes, ensure the database/content has the referenced items
4. Re-run this script after fixes to verify
`;
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
