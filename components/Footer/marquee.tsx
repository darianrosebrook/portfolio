'use client';
import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Styles from './index.module.css';
import { horizontalLoop } from '@/utils';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { byPrefixAndName } from '@awesome.me/kit-0ba7f5fefb/icons';
import Icon from '../Icon';
type MarqueeProps = {
  title: string;
  icon: IconDefinition;
  url: string;
};
const faArrowUpRight = byPrefixAndName['far']['arrow-up-right'];

const Marquee: React.FC<MarqueeProps> = ({ title, icon, url }) => {
  const marqueeRef = useRef(null); // Create a ref for the marquee element
  const clone = (index) => (
    <div className={Styles.box} key={index}>
      <p className={`heading-04 ${Styles.socialLinkTitle}`}>
        {title.toUpperCase()}
        <Icon width={48} height={48} icon={icon} />
      </p>
    </div>
  );
  const clones = Array(20).fill(clone);

  useGSAP(
    () => {
      const boxes = marqueeRef.current.querySelectorAll(`.${Styles.box}`);
      gsap.set(marqueeRef.current, { perspective: 500 });
      const loop = horizontalLoop(boxes, {
        repeat: -1,
        paused: false,
        speed: 1,
      });
      return loop;
    },
    { scope: marqueeRef.current }
  );
  return (
    <>
      <Link href={url} className={Styles.socialLink}>
        <h4 className={Styles.socialLinkTitle}>
          {title.toUpperCase()}
          <Icon width={48} height={48} icon={faArrowUpRight} />
        </h4>
        <div className={Styles.marquee} ref={marqueeRef}>
          {clones && clones.map((clone, index) => clone(index))}
        </div>
      </Link>
    </>
  );
};

export default Marquee;
