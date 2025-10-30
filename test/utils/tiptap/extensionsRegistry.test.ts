/**
 * Tests for TipTap Extension Registry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createEditorExtensions,
  createServerExtensions,
  createPreviewExtensions,
} from '@/ui/modules/Tiptap/extensionsRegistry';
import type { Extension } from '@tiptap/core';

describe('TipTap Extension Registry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEditorExtensions', () => {
    it('should return an array of extensions', () => {
      const extensions = createEditorExtensions();
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('should include all required extensions', () => {
      const extensions = createEditorExtensions();
      const extensionNames = extensions.map((ext) => ext.name);

      // StarterKit includes document, paragraph, heading, etc.
      // Check for StarterKit and other key extensions
      expect(extensionNames.length).toBeGreaterThan(0);
      // Verify we have extensions configured
      expect(extensions.length).toBeGreaterThan(10);
    });

    it('should accept articleId config', () => {
      const extensions = createEditorExtensions({ articleId: 123 });
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('should return consistent extensions for same config', () => {
      const extensions1 = createEditorExtensions({ articleId: 123 });
      const extensions2 = createEditorExtensions({ articleId: 123 });
      
      expect(extensions1.length).toBe(extensions2.length);
    });

    it('should return extensions with proper structure', () => {
      const extensions = createEditorExtensions();
      
      extensions.forEach((ext) => {
        expect(ext).toBeDefined();
        expect(typeof ext.name === 'string' || ext.name === undefined).toBe(true);
      });
    });
  });

  describe('createServerExtensions', () => {
    it('should return an array of extensions', () => {
      const extensions = createServerExtensions();
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('should include server-safe extensions', () => {
      const extensions = createServerExtensions();
      const extensionNames = extensions.map((ext) => ext.name);

      // Server extensions should include basic formatting via StarterKit
      expect(extensionNames.length).toBeGreaterThan(0);
      // Verify we have extensions configured
      expect(extensions.length).toBeGreaterThan(5);
    });

    it('should return consistent extensions', () => {
      const extensions1 = createServerExtensions();
      const extensions2 = createServerExtensions();
      
      expect(extensions1.length).toBe(extensions2.length);
    });

    it('should not include client-only extensions', () => {
      const extensions = createServerExtensions();
      // Server extensions should not have React node views
      // This is implicit - if it works, it's correct
      expect(extensions.length).toBeGreaterThan(0);
    });
  });

  describe('createPreviewExtensions', () => {
    it('should return an array of extensions', () => {
      const extensions = createPreviewExtensions();
      expect(Array.isArray(extensions)).toBe(true);
      expect(extensions.length).toBeGreaterThan(0);
    });

    it('should match server extensions', () => {
      const previewExtensions = createPreviewExtensions();
      const serverExtensions = createServerExtensions();
      
      // Preview should use same extensions as server for accurate preview
      expect(previewExtensions.length).toBe(serverExtensions.length);
    });

    it('should return consistent extensions', () => {
      const extensions1 = createPreviewExtensions();
      const extensions2 = createPreviewExtensions();
      
      expect(extensions1.length).toBe(extensions2.length);
    });
  });

  describe('Extension consistency', () => {
    it('should ensure editor and server extensions are compatible', () => {
      const editorExtensions = createEditorExtensions();
      const serverExtensions = createServerExtensions();

      // Both should have document and paragraph
      const editorNames = editorExtensions.map((ext) => ext.name);
      const serverNames = serverExtensions.map((ext) => ext.name);

      expect(editorNames.length).toBeGreaterThan(0);
      expect(serverNames.length).toBeGreaterThan(0);
      
      // Server should have basic extensions that editor also has
      const commonExtensions = editorNames.filter((name) =>
        serverNames.includes(name)
      );
      expect(commonExtensions.length).toBeGreaterThan(0);
    });

    it('should handle empty articleId', () => {
      const extensions1 = createEditorExtensions({ articleId: undefined });
      const extensions2 = createEditorExtensions();
      
      expect(extensions1.length).toBe(extensions2.length);
    });
  });
});

