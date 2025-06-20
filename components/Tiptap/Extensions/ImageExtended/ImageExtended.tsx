import { upload } from '@/utils/supabase/upload';
import Image from '@tiptap/extension-image';
import { Plugin } from 'prosemirror-state';

interface ImageExtendedOptions {
  articleId?: number;
}

export default Image.extend<ImageExtendedOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      articleId: undefined,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      'data-align': {
        default: 'center',
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      {
        ...HTMLAttributes,
        class: `align-${HTMLAttributes['data-align']}`,
      },
    ];
  },

  addProseMirrorPlugins() {
    const { articleId } = this.options;

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (!coordinates) {
                return false;
              }

              images.forEach(async (image) => {
                try {
                  let { name } = image;
                  if (name === 'image.png') {
                    name = `${Math.random().toString(36).substring(7)}-${name}`;
                  }

                  const path = await upload({
                    file: {
                      type: 'image',
                      media: {
                        name,
                        data: image,
                      },
                    },
                    bucket: 'article-images',
                    articleId,
                  });

                  const node = schema.nodes.image.create({
                    src: path,
                  });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node
                  );
                  view.dispatch(transaction);
                } catch (error) {
                  console.error('Failed to upload image:', error);
                  // Optionally show user feedback here
                }
              });

              return true;
            },
            paste(view, event) {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;

              if (!hasFiles) {
                return false;
              }

              const images = Array.from(event.clipboardData.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false;
              }

              event.preventDefault();

              const { schema } = view.state;

              images.forEach(async (image) => {
                try {
                  let { name } = image;
                  if (name === 'image.png') {
                    name = `${Math.random().toString(36).substring(7)}-${name}`;
                  }

                  const path = await upload({
                    file: {
                      type: 'image',
                      media: {
                        name,
                        data: image,
                      },
                    },
                    bucket: 'article-images',
                    articleId,
                  });

                  const node = schema.nodes.image.create({
                    src: path,
                  });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                } catch (error) {
                  console.error('Failed to upload image:', error);
                  // Optionally show user feedback here
                }
              });

              return true;
            },
          },
        },
      }),
    ];
  },
});
