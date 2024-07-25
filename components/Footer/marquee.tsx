"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Styles from "./index.module.css";
import { horizontalLoop } from "@/utils";
type MarqueeProps = {
  title: string;
  items: [string, string];
  children?: React.ReactNode;
};

const Marquee: React.FC<MarqueeProps> = ({ title, items, children }) => {
  const href = items[0];
  let icon = items[1]; 
  const marqueeRef = useRef(null); // Create a ref for the marquee element
  const clone = (index) => (
    <div className={Styles.box} key={index}>
      <p className={`heading-04 ${Styles.socialLinkTitle}`}>
        {title.toUpperCase()}
        <i className={`fa${icon === "file-alt" ? "l" : 'b'} fa-${icon}`}></i>
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
  const pauseOnHover = (e) => {
    e.target.classList.add(Styles.pause);
  };
  return (
    <>
      <Link href={href} className={Styles.socialLink}>
        <h4 className={Styles.socialLinkTitle}>
          {title.toUpperCase()}
          <i className={`fal fa-arrow-up-right`}></i>
        </h4>
        <div className={Styles.marquee} ref={marqueeRef}>
          {clones && clones.map((clone, index) => clone(index))}
        </div>
      </Link>
    </>
  );
};

export default Marquee;
