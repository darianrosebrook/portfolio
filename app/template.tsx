'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type TemplateProps = {
  children: React.ReactNode;
};

/**
 * Per-navigation wrapper. Next.js remounts this on every client navigation,
 * so it holds only work that should re-run per route: the main-content fade
 * and the selection-highlight listener. Persistent app chrome and context
 * providers live in the root layout (app/layout.tsx) so they mount once.
 */
const Template: React.FC<TemplateProps> = ({ children }) => {
  const ref = useRef(null);
  const handleSelectionChange = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!handleSelectionChange.current) {
      // Fires on every selectionchange event. When selection text is empty,
      // the user just deselected — pick a random highlight color on deselect.
      handleSelectionChange.current = () => {
        const selection = document.getSelection();
        if (selection && '' === selection.toString()) {
          const rootElement = document.body;
          let isDarkTheme = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          const htmlClassList = document.documentElement.classList;
          if (htmlClassList.contains('light')) {
            isDarkTheme = false;
          }
          if (htmlClassList.contains('dark')) {
            isDarkTheme = true;
          }

          const colors = [
            'red',
            'orange',
            'yellow',
            'green',
            'teal',
            'blue',
            'violet',
          ];
          const newColorIndex = Math.floor(Math.random() * colors.length);
          const color = colors[newColorIndex];
          const val = isDarkTheme ? ['200', '700'] : ['700', '200'];
          const foreground = `var(--core-color-palette-${color}-${val[0]})`;
          const background = `var(--core-color-palette-${color}-${val[1]})`;
          rootElement.style.setProperty(
            '--semantic-color-foreground-highlight',
            foreground
          );
          rootElement.style.setProperty(
            '--semantic-color-background-highlight',
            background
          );
        }
      };
    }
    if (handleSelectionChange.current) {
      document.addEventListener(
        'selectionchange',
        handleSelectionChange.current
      );
    }

    return () => {
      if (handleSelectionChange.current) {
        document.removeEventListener(
          'selectionchange',
          handleSelectionChange.current
        );
      }
    };
  }, []);

  useGSAP(() => {
    gsap.to(ref.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power2.inOut',
    });
  }, []);

  return <main ref={ref}>{children}</main>;
};

export default Template;
