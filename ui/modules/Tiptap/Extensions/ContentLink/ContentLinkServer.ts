import { Node, mergeAttributes } from '@tiptap/core';
import {
  CONTENT_LINK_PARSE_HTML,
  contentLinkAttributes,
  renderContentLinkHTML,
  type ContentLinkAttrs,
} from './contentLinkShared';

export interface ContentLinkServerOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * Server-safe contentLink node (no React node view, no suggestion plugin).
 * Registered in createServerExtensions so saved documents containing
 * content links parse and render in generated HTML and previews.
 */
export const ContentLinkServer = Node.create<ContentLinkServerOptions>({
  name: 'contentLink',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,
  group: 'inline',
  atom: true,

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
});
