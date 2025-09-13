import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VideoNodeView from './VideoNodeView';

export interface VideoExtendedOptions {
  HTMLAttributes: Record<string, any>;
  bucket?: string;
  getArticleId?: () => number | undefined;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoExtended: {
      /**
       * Insert a video
       */
      setVideo: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

/**
 * Video extension for Tiptap
 * Supports video embedding with upload capabilities and responsive display
 *
 * @author @darianrosebrook
 */
export const VideoExtended = Node.create<VideoExtendedOptions>({
  name: 'video',

  addOptions() {
    return {
      HTMLAttributes: {},
      bucket: 'article-videos',
      getArticleId: undefined,
    } as VideoExtendedOptions;
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

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || '',
              title: options.title || '',
              controls: true,
              'data-align': 'center',
            },
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-v': () => {
        const url = window.prompt('Enter video URL:');
        if (url) {
          return this.editor.commands.setVideo({ src: url });
        }
        return false;
      },
    };
  },
});
