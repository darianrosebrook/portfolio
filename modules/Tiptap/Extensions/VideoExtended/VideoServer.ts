import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoServerOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * Server-safe Video extension for Tiptap
 * Used for server-side rendering without React components
 *
 * @author @darianrosebrook
 */
export const VideoServer = Node.create<VideoServerOptions>({
  name: 'video',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('src'),
        renderHTML: (attrs: Record<string, string>) => ({
          src: attrs.src,
        }),
      },
      alt: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('alt'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.alt ? { alt: attrs.alt } : {},
      },
      title: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('title'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.title ? { title: attrs.title } : {},
      },
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('width'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.width ? { width: attrs.width } : {},
      },
      height: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('height'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.height ? { height: attrs.height } : {},
      },
      controls: {
        default: true,
        parseHTML: (el: HTMLElement) => el.hasAttribute('controls'),
        renderHTML: (attrs: Record<string, boolean>) =>
          attrs.controls ? { controls: 'true' } : {},
      },
      autoplay: {
        default: false,
        parseHTML: (el: HTMLElement) => el.hasAttribute('autoplay'),
        renderHTML: (attrs: Record<string, boolean>) =>
          attrs.autoplay ? { autoplay: 'true' } : {},
      },
      loop: {
        default: false,
        parseHTML: (el: HTMLElement) => el.hasAttribute('loop'),
        renderHTML: (attrs: Record<string, boolean>) =>
          attrs.loop ? { loop: 'true' } : {},
      },
      muted: {
        default: false,
        parseHTML: (el: HTMLElement) => el.hasAttribute('muted'),
        renderHTML: (attrs: Record<string, boolean>) =>
          attrs.muted ? { muted: 'true' } : {},
      },
      poster: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('poster'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.poster ? { poster: attrs.poster } : {},
      },
      'data-align': {
        default: 'center',
        parseHTML: (el: HTMLElement) =>
          el.getAttribute('data-align') ?? 'center',
        renderHTML: (attrs: Record<string, string>) => ({
          'data-align': attrs['data-align'],
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },
});
