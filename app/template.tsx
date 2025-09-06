'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ReducedMotionProvider,
  InteractionProvider,
  UserProvider,
} from '@/context';
import Navbar from '@/modules/Navbar';
import Footer from '@/modules/Footer';
import SlinkyCursor from '@/components/SlinkyCursor';
type TemplateProps = {
  children: React.ReactNode;
};

const Template: React.FC<TemplateProps> = ({ children }) => {
  const ref = useRef(null);
  const handleSelectionChange = useRef<(() => void) | null>(null);

  /**
   * Top-level navigation pages for the main Navbar.
   * @type {{ name: string; path: string; admin: boolean }[]}
   */
  const pages = [
    { name: 'Blueprints', path: 'blueprints', admin: false },
    { name: 'Articles', path: 'articles', admin: false },
    { name: 'Work', path: 'work', admin: false },
    { name: 'Design Tools', path: 'tools', admin: false },
  ];
  useEffect(() => {
    if (!handleSelectionChange.current) {
      handleSelectionChange.current = () => {
        const selection = document.getSelection();
        if (selection && '' === selection.toString()) {
          const rootElement = document.body;
          let isDarkTheme = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          const bodyClassOverride = rootElement.classList;
          if (bodyClassOverride.contains('light')) {
            isDarkTheme = false;
          }
          if (bodyClassOverride.contains('dark')) {
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
          const foreground = `var(--color-core-${color}-${val[0]})`;
          const background = `var(--color-core-${color}-${val[1]})`;
          rootElement.style.setProperty(
            '--color-foreground-highlight',
            foreground
          );
          rootElement.style.setProperty(
            '--color-background-highlight',
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

  return (
    <ReducedMotionProvider>
      <InteractionProvider>
        <UserProvider>
          <Navbar pages={pages} />
          <main ref={ref}>{children}</main>
          <Footer />
          <SlinkyCursor />
        </UserProvider>
      </InteractionProvider>
    </ReducedMotionProvider>
  );
};

export default Template;
