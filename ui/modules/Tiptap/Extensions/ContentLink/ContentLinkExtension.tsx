'use client';

import { Node, InputRule, mergeAttributes } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ContentLinkNodeView } from './ContentLinkNodeView';
import {
  CONTENT_LINK_PARSE_HTML,
  contentLinkAttributes,
  renderContentLinkHTML,
  type ContentLinkAttrs,
} from './contentLinkShared';
import {
  fetchContentSuggestions,
  renderContentLinkSuggestions,
  type ContentLinkSuggestionItem,
} from './contentLinkSuggestion';

const contentLinkPluginKey = new PluginKey('contentLinkSuggestion');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    contentLink: {
      /** Insert an already-resolved content link plus a trailing space. */
      insertContentLink: (attrs: {
        id: number;
        contentType: 'article' | 'case-study';
        slug: string | null;
        title: string;
      }) => ReturnType;
    };
  }
}

export interface ContentLinkOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * Inline semantic link to another article or case study.
 *
 * Two authoring flows share one node type:
 * - Wiki flow: typing `[[Some title]]` inserts an unresolved node that the
 *   node view resolves against the search API (exact title match only).
 * - Mention flow: `@` opens a suggestion popup and inserts an
 *   already-resolved node.
 *
 * Server/preview rendering lives in ContentLinkServer; keep the shared
 * schema in contentLinkShared.ts.
 */
export const ContentLinkExtension = Node.create<ContentLinkOptions>({
  name: 'contentLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addAttributes() {
    return contentLinkAttributes();
  },

  parseHTML() {
    return CONTENT_LINK_PARSE_HTML;
  },

  renderHTML({ node, HTMLAttributes }) {
    return renderContentLinkHTML(
      node.attrs as ContentLinkAttrs,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)
    );
  },

  renderText({ node }) {
    return `[[${node.attrs.title ?? ''}]]`;
  },

  addCommands() {
    return {
      insertContentLink:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent([
            {
              type: this.name,
              attrs: { ...attrs, resolved: true },
            },
            { type: 'text', text: ' ' },
          ]),
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[\[([^\]]+)\]\]$/,
        handler: ({ state, range, match }) => {
          const title = (match[1] ?? '').trim();
          if (!title) return;
          state.tr
            .replaceWith(range.from, range.to, [
              this.type.create({ title, resolved: false }),
            ])
            .scrollIntoView();
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ContentLinkNodeView);
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<ContentLinkSuggestionItem>({
        editor: this.editor,
        pluginKey: contentLinkPluginKey,
        char: '@',
        startOfLine: false,
        allowSpaces: false,
        // The picked item carries its own command (deleteRange + node
        // insertion); the renderer and Suggestion's pick path both route
        // through it, mirroring the SlashCommand pattern.
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        items: async ({ query }) => {
          const results = await fetchContentSuggestions(query);
          return results.map<ContentLinkSuggestionItem>((item) => ({
            ...item,
            command: ({ editor, range }) => {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContentAt(range.from, [
                  {
                    type: this.name,
                    attrs: {
                      id: item.id,
                      contentType: item.type,
                      slug: item.slug,
                      title: item.title,
                      resolved: true,
                    },
                  },
                  { type: 'text', text: ' ' },
                ])
                .run();
            },
          }));
        },
        render: renderContentLinkSuggestions,
      }),
    ];
  },
});
