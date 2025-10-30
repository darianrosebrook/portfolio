/**
 * Centralized TipTap Extensions Registry
 *
 * This module provides a single source of truth for TipTap extensions
 * used across editor and server-side rendering. Ensures consistency
 * between what users can create in the editor and what renders on pages.
 *
 * @author @darianrosebrook
 */

import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Dropcursor from '@tiptap/extension-dropcursor';
import Focus from '@tiptap/extension-focus';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { DetailsExtension } from './Extensions/Details/DetailsExtension';
import { TableOfContentsExtension } from './Extensions/TableOfContents/TableOfContentsExtension';
import { UniqueIdExtension } from './Extensions/UniqueId/UniqueIdExtension';
import { DragHandleExtension } from './Extensions/DragHandle/DragHandleExtension';
import { SlashCommand } from './Extensions/SlashCommand';
import { CodeBlockExtended } from './Extensions/CodeBlockExtended';
import { ImageExtended } from './Extensions/ImageExtended';
import { VideoExtended } from './Extensions/VideoExtended';
import { DetailsServer } from './Extensions/Details/DetailsServer';
import { TableOfContentsServer } from './Extensions/TableOfContents/TableOfContentsServer';
import { VideoServer } from './Extensions/VideoExtended/VideoServer';
import type { Extension } from '@tiptap/core';

/**
 * Configuration for creating editor extensions
 */
export interface EditorExtensionsConfig {
  articleId?: number;
}

/**
 * Creates extensions for the TipTap editor (client-side)
 * Includes all interactive features and React node views
 */
export function createEditorExtensions(
  config: EditorExtensionsConfig = {}
): Extension[] {
  const { articleId } = config;

  return [
    // Cast to Extension[] to satisfy TypeScript
    // All TipTap extensions (Marks, Nodes) implement Extension
    StarterKit.configure({ codeBlock: false }),
    Dropcursor.configure({
      color: 'var(--color-accent)',
      width: 2,
    }),
    Focus.configure({
      className: 'is-focused',
      mode: 'all',
    }),
    Link.configure({
      autolink: true,
      openOnClick: true,
      linkOnPaste: true,
      protocols: ['http', 'https', 'mailto'],
    }),
    Highlight,
    HorizontalRule,
    TaskList,
    TaskItem.configure({ nested: true }),
    ImageExtended.configure({
      bucket: 'article-images',
      getArticleId: () => articleId,
    }),
    VideoExtended.configure({
      bucket: 'article-videos',
      getArticleId: () => articleId,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return "What's the title?";
        }
        return 'Start writing or type "/" for commands...';
      },
    }),
    DetailsExtension.configure({
      HTMLAttributes: {
        class: 'details-block',
      },
    }),
    TableOfContentsExtension.configure({
      HTMLAttributes: {
        class: 'table-of-contents-block',
      },
      maxDepth: 3,
      showNumbers: false,
    }),
    UniqueIdExtension.configure({
      types: ['heading'],
      generateId: (node) => {
        const text = node.textContent || '';
        return text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      },
    }),
    DragHandleExtension.configure({
      draggableTypes: [
        'paragraph',
        'heading',
        'blockquote',
        'details',
        'tableOfContents',
        'image',
        'video',
      ],
      showDragHandles: true,
    }),
    CodeBlockExtended,
    SlashCommand,
    CharacterCount,
  ] as Extension[];
}

/**
 * Creates extensions for server-side HTML generation
 * Uses server-safe extensions without React node views
 */
export function createServerExtensions(): Extension[] {
  return [
    // Cast to Extension[] to satisfy TypeScript
    // All TipTap extensions (Marks, Nodes) implement Extension
    StarterKit,
    CharacterCount,
    Image,
    VideoServer,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({
      autolink: true,
      openOnClick: false,
      linkOnPaste: true,
      protocols: ['http', 'https', 'mailto'],
    }),
    Highlight,
    HorizontalRule,
    TaskList,
    TaskItem.configure({ nested: true }),
    DetailsServer,
    TableOfContentsServer,
  ] as Extension[];
}

/**
 * Creates extensions for preview mode (used in ContentEditor)
 * Should match server extensions for accurate preview
 */
export function createPreviewExtensions(): Extension[] {
  return createServerExtensions();
}
