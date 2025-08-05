'use client';

import dynamic from 'next/dynamic';
import { Editor } from '@tiptap/react';

// Dynamically import Toolbar components for better performance
const Toolbar = dynamic(() => import('../Toolbar/Toolbar'), {
  loading: () => <div>Loading toolbar...</div>,
  ssr: false,
});

const ImageToolbar = dynamic(() => import('../Toolbar/ImageToolbar'), {
  loading: () => <div>Loading image toolbar...</div>,
  ssr: false,
});

interface ToolbarWrapperProps {
  editor: Editor | null;
}

export default function ToolbarWrapper({ editor }: ToolbarWrapperProps) {
  if (!editor) return null;

  return (
    <>
      <Toolbar editor={editor} />
      <ImageToolbar editor={editor} />
    </>
  );
}
