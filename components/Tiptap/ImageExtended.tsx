import { upload } from '@/utils/supabase/upload';
import Image from '@tiptap/extension-image';
import { Plugin } from 'prosemirror-state';

export default Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view, event) {
              console.log('drop event', event);
              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length;

              if (!hasFiles) {
                return;
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return;
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              images.forEach((image) => {
                let { name } = image;
                if (name === 'image.png') {
                  name = `${Math.random().toString(36).substring(7)}-${name}`;
                }
                const reader = new FileReader();
                reader.onload = async () => {
                  const path = await upload({
                    file: {
                      type: 'image',
                      media: {
                        name,
                        data: image,
                      },
                    },
                    bucket: 'article-images',
                  });
                  const node = schema.nodes.image.create({
                    src: path,
                  });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node
                  );
                  view.dispatch(transaction);
                };
                reader.readAsDataURL(image);
              });
            },
            paste(view, event) {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;

              if (!hasFiles) {
                return;
              }

              const images = Array.from(event.clipboardData.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return;
              }

              event.preventDefault();

              const { schema } = view.state;

              images.forEach((image) => {
                let { name } = image;
                if (name === 'image.png') {
                  name = `${Math.random().toString(36).substring(7)}-${name}`;
                }
                const reader = new FileReader();

                reader.onload = async () => {
                  const path = await upload({
                    file: {
                      type: 'image',
                      media: {
                        name,
                        data: image,
                      },
                    },
                    bucket: 'article-images',
                  });
                  const node = schema.nodes.image.create({
                    src: path,
                  });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                };
                reader.readAsDataURL(image);
              });
            },
          },
        },
      }),
    ];
  },
});
