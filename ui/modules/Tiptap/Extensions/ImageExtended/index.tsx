import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Editor } from '@tiptap/core';
import { Media, upload } from '@/utils/supabase/upload';

export interface ImageExtendedOptions {
  bucket: string;
  getArticleId?: () => number | undefined;
}

function pasteDropPlugin(editor: Editor, options: ImageExtendedOptions) {
  return new Plugin({
    key: new PluginKey('image-extended-paste-drop'),
    props: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const file = items
          .map((i) => (i.kind === 'file' ? i.getAsFile() : null))
          .find(Boolean);
        if (!file || !file.type.startsWith('image/')) return false;

        event.preventDefault();
        const articleId = options.getArticleId?.();
        void upload({
          file: {
            type: 'image',
            media: { name: file.name, data: file } as Media,
          },
          bucket: options.bucket,
          articleId,
        })
          .then((url) => {
            editor.chain().focus().setImage({ src: url }).run();
          })
          .catch(console.error);
        return true;
      },
      handleDrop(_view, event) {
        const dt = event.dataTransfer;
        if (!dt || !dt.files?.length) return false;
        const file = dt.files[0];
        if (!file || !file.type.startsWith('image/')) return false;
        event.preventDefault();
        const articleId = options.getArticleId?.();
        void upload({
          file: {
            type: 'image',
            media: { name: file.name, data: file } as Media,
          },
          bucket: options.bucket,
          articleId,
        })
          .then((url) => {
            editor.chain().focus().setImage({ src: url }).run();
          })
          .catch(console.error);
        return true;
      },
    },
  });
}

export const ImageExtended = Image.extend<ImageExtendedOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      bucket: 'article-images',
      getArticleId: undefined,
    } as ImageExtendedOptions;
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-caption'),
        renderHTML: (attrs: Record<string, string>) =>
          attrs.caption ? { 'data-caption': attrs.caption } : {},
      },
      'data-align': {
        default: 'center',
        parseHTML: (el: HTMLElement) =>
          el.getAttribute('data-align') ?? 'center',
        renderHTML: (attrs: Record<string, string>) => ({
          'data-align': attrs['data-align'],
        }),
      },
    } as Record<string, unknown>;
  },
  addProseMirrorPlugins() {
    return [pasteDropPlugin(this.editor, this.options)];
  },
});
