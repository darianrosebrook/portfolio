/**
 * Design Tokens Cache System
 * 
 * Provides file hash caching and incremental build support
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PROJECT_ROOT, PATHS } from './index';

const CACHE_DIR = path.join(PROJECT_ROOT, 'utils', 'designTokens', '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'file-hashes.json');

interface CacheEntry {
  hash: string;
  timestamp: number;
}

interface FileCache {
  [filePath: string]: CacheEntry;
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Calculate file hash
 */
function calculateFileHash(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Load cache from disk
 */
function loadCache(): FileCache {
  ensureCacheDir();
  
  if (!fs.existsSync(CACHE_FILE)) {
    return {};
  }

  try {
    const content = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(content) as FileCache;
  } catch {
    return {};
  }
}

/**
 * Save cache to disk
 */
function saveCache(cache: FileCache): void {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

/**
 * Check if file has changed since last build
 */
export function hasFileChanged(filePath: string): boolean {
  const cache = loadCache();
  const currentHash = calculateFileHash(filePath);
  const cachedEntry = cache[filePath];

  if (!cachedEntry) {
    return true; // New file, consider changed
  }

  return cachedEntry.hash !== currentHash;
}

/**
 * Update cache for a file
 */
export function updateFileCache(filePath: string): void {
  const cache = loadCache();
  const hash = calculateFileHash(filePath);
  
  cache[filePath] = {
    hash,
    timestamp: Date.now(),
  };

  saveCache(cache);
}

/**
 * Get all files that have changed
 */
export function getChangedFiles(filePaths: string[]): string[] {
  return filePaths.filter((filePath) => {
    if (!fs.existsSync(filePath)) {
      return true; // Missing file, consider changed
    }
    return hasFileChanged(filePath);
  });
}

/**
 * Clear cache for specific files
 */
export function clearFileCache(filePaths: string[]): void {
  const cache = loadCache();
  filePaths.forEach((filePath) => {
    delete cache[filePath];
  });
  saveCache(cache);
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalFiles: number;
  cachedFiles: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const cache = loadCache();
  const timestamps = Object.values(cache).map((entry) => entry.timestamp);

  return {
    totalFiles: Object.keys(cache).length,
    cachedFiles: timestamps.length,
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}

/**
 * Get all files that need to be checked for a build step
 */
export function getTokenFilesToCheck(): string[] {
  const files: string[] = [];

  // Core token files - check modular structure first
  const coreDir = path.join(PROJECT_ROOT, 'ui', 'designTokens', 'core');
  if (fs.existsSync(coreDir)) {
    const coreFiles = fs.readdirSync(coreDir, { recursive: true });
    const hasModularFiles = coreFiles.some(
      (file) =>
        typeof file === 'string' &&
        file.endsWith('.tokens.json') &&
        !file.startsWith('_')
    );

    if (hasModularFiles) {
      // Use modular files
      coreFiles.forEach((file) => {
        if (
          typeof file === 'string' &&
          file.endsWith('.tokens.json') &&
          !file.startsWith('_')
        ) {
          files.push(path.join(coreDir, file));
        }
      });
    } else {
      // Fallback to monolithic file
      if (fs.existsSync(PATHS.coreTokens)) {
        files.push(PATHS.coreTokens);
      }
    }
  } else {
    // Fallback to monolithic file
    if (fs.existsSync(PATHS.coreTokens)) {
      files.push(PATHS.coreTokens);
    }
  }

  // Semantic token files - check modular structure first
  const semanticDir = path.join(
    PROJECT_ROOT,
    'ui',
    'designTokens',
    'semantic'
  );
  if (fs.existsSync(semanticDir)) {
    const semanticFiles = fs.readdirSync(semanticDir, { recursive: true });
    const hasModularFiles = semanticFiles.some(
      (file) =>
        typeof file === 'string' &&
        file.endsWith('.tokens.json') &&
        !file.startsWith('_')
    );

    if (hasModularFiles) {
      // Use modular files
      semanticFiles.forEach((file) => {
        if (
          typeof file === 'string' &&
          file.endsWith('.tokens.json') &&
          !file.startsWith('_')
        ) {
          files.push(path.join(semanticDir, file));
        }
      });
    } else {
      // Fallback to monolithic file
      if (fs.existsSync(PATHS.semanticTokens)) {
        files.push(PATHS.semanticTokens);
      }
    }
  } else {
    // Fallback to monolithic file
    if (fs.existsSync(PATHS.semanticTokens)) {
      files.push(PATHS.semanticTokens);
    }
  }

  return files;
}

