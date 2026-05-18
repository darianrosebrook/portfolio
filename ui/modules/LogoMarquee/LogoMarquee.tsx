'use client';
import { useRef, type CSSProperties } from 'react';
import './LogoMarquee.css';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { horizontalLoop } from '@/utils/helpers';
import LogoSprite from './LogoSprite';

type LogoDefinition = {
  id: string;
  viewBox: string;
  width: number;
  height: number;
};

const LOGO_REPEAT_COUNT = 3;

const LOGOS: LogoDefinition[] = [
  { id: 'compassofdesign', viewBox: '0 0 477 128', width: 477, height: 128 },
  { id: 'microsoft', viewBox: '0 0 339 128', width: 339, height: 128 },
  {
    id: 'verizon',
    viewBox: '0 0 796.916 326.656',
    width: 796.916,
    height: 326.656,
  },
  {
    id: 'qualtrics_XM_white',
    viewBox: '0 0 367.96 194.52',
    width: 367.96,
    height: 194.52,
  },
  { id: 'shiplane', viewBox: '0 0 358 128', width: 358, height: 128 },
  { id: 'ebay', viewBox: '0 0 247 128', width: 247, height: 128 },
  { id: 'rockagile', viewBox: '0 0 356 129', width: 356, height: 129 },
  { id: 'nike', viewBox: '0 0 225 128', width: 225, height: 128 },
  {
    id: 'theglassfrontier',
    viewBox: '0 0 284 128',
    width: 284,
    height: 128,
  },
  { id: 'salesforce', viewBox: '0 0 184 129', width: 184, height: 129 },
  {
    id: 'clinicallymedia',
    viewBox: '0 0 213 128',
    width: 213,
    height: 128,
  },
  { id: 'keyspark', viewBox: '0 0 379 128', width: 379, height: 128 },
  { id: 'travelight', viewBox: '0 0 191 128', width: 191, height: 128 },
  { id: 'minimum', viewBox: '0 0 321 128', width: 321, height: 128 },
];

const LogoMarquee: React.FC = () => {
  const logoMarqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!logoMarqueeRef.current) return;

      const boxElements = logoMarqueeRef.current.querySelectorAll('.box');
      const marqueeStyles = window.getComputedStyle(logoMarqueeRef.current);

      gsap.set(logoMarqueeRef.current, { perspective: 500 });
      const loop = horizontalLoop(boxElements, {
        repeat: -1,
        paused: false,
        speed: 1,
        paddingRight: marqueeStyles.columnGap,
      });

      return () => {
        if (loop) loop.kill();
      };
    },
    {
      scope: logoMarqueeRef,
      dependencies: [],
    }
  );

  return (
    <div data-ds-component="LogoMarquee">
      <LogoSprite />
      <div className="marquee" ref={logoMarqueeRef}>
        {Array.from({ length: LOGO_REPEAT_COUNT }, (_, repeatIndex) =>
          LOGOS.map((logo) => (
            <div className="box" key={`${repeatIndex}-${logo.id}`}>
              <svg
                aria-hidden="true"
                className="logo"
                focusable="false"
                style={
                  {
                    '--logo-aspect-ratio': `${logo.width} / ${logo.height}`,
                  } as CSSProperties
                }
                viewBox={logo.viewBox}
              >
                <use href={`#${logo.id}`} />
              </svg>
            </div>
          ))
        )}
      </div>
      <div className="cover"></div>
    </div>
  );
};

export default LogoMarquee;
