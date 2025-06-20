import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import styles from './DraggableNodeView.module.scss';
import Icon from '@/components/Icon';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';

const faGripVertical = byPrefixAndName['far']['grip-vertical'];

const createSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

export const DraggableNode = ({ node }) => {
  const id =
    node.type.name === 'heading' ? createSlug(node.textContent) : undefined;

  return (
    <NodeViewWrapper
      as={
        (node.type.name === 'heading' ? `h${node.attrs.level}` : 'p') as
          | 'h1'
          | 'h2'
          | 'h3'
          | 'p'
      }
      id={id}
      className={styles.container}
    >
      <div
        className={styles.dragHandle}
        contentEditable="false"
        draggable="true"
        data-drag-handle
      >
        <Icon icon={faGripVertical} />
      </div>
      <NodeViewContent className={styles.content} />
    </NodeViewWrapper>
  );
};
