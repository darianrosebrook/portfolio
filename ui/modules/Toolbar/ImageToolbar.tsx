import React from 'react';
import { Editor } from '@tiptap/react';
import './ImageToolbar.css';
import Icon from '../../components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
const faAlignLeft = byPrefixAndName['far']['align-left'];
const faAlignCenter = byPrefixAndName['far']['align-center'];
const faAlignRight = byPrefixAndName['far']['align-right'];

type ImageToolbarProps = {
  editor: Editor;
};

const ImageToolbar: React.FC<ImageToolbarProps> = ({ editor }) => {
  const setAlignment = (align: 'left' | 'center' | 'right') => {
    editor
      .chain()
      .focus()
      .updateAttributes('image', { 'data-align': align })
      .run();
  };

  return (
    <div data-ds-component="ImageToolbar">
      <button
        onClick={() => setAlignment('left')}
        className={
          editor.isActive('image', { 'data-align': 'left' }) ? 'isActive' : ''
        }
      >
        <Icon icon={faAlignLeft} />
      </button>
      <button
        onClick={() => setAlignment('center')}
        className={
          editor.isActive('image', { 'data-align': 'center' }) ? 'isActive' : ''
        }
      >
        <Icon icon={faAlignCenter} />
      </button>
      <button
        onClick={() => setAlignment('right')}
        className={
          editor.isActive('image', { 'data-align': 'right' }) ? 'isActive' : ''
        }
      >
        <Icon icon={faAlignRight} />
      </button>
    </div>
  );
};

export default ImageToolbar;
