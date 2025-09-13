'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import dynamic from 'next/dynamic';

// Dynamic import for performance optimization
const Toolbar = dynamic(() => import('@/ui/modules/Toolbar/Toolbar'), {
  loading: () => <div style={{ height: '40px' }} />, // Placeholder to prevent layout shift
  ssr: false,
});

interface ToolbarWrapperProps {
  editor: Editor;
}

/**
 * Wrapper component for dynamic toolbar import
 * Part of the performance optimization to reduce initial bundle size
 */
const ToolbarWrapper: React.FC<ToolbarWrapperProps> = ({ editor }) => {
  return <Toolbar editor={editor} />;
};

export default ToolbarWrapper;
