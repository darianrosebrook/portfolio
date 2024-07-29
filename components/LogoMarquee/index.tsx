'use client'
import { useRef, useEffect, useState } from 'react';
import Styles from './index.module.scss';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { horizontalLoop } from "@/utils";
import LogoSprite from "./LogoSprite";

const LogoMarquee: React.FC = () => {
    const logoMarqueeRef = useRef(null);
    const spriteRef = useRef(null);
    const [boxes, setBoxes] = useState(null);
    const [isBoxesReady, setIsBoxesReady] = useState(false);

    const box = (svg) => (
        <div className={Styles.box} key={svg.id}>
            <svg className={Styles.logo}  >
                <use href={`#${svg.id}`} />
            </svg>
        </div>
    );
    const clones = Array(20).fill(box);

    useGSAP(() => {
        if (!isBoxesReady) return;
        const boxElements = logoMarqueeRef.current.children
        gsap.set(logoMarqueeRef.current, { perspective: 500 });
        const loop = horizontalLoop(boxElements, {
            repeat: -1,
            paused: false,
            speed: 1,
        });
        return () => loop.kill();
    }, {
        scope: logoMarqueeRef,
        dependencies: [isBoxesReady]
    });

    useEffect(() => {
        const LOGOSPRITE = document.getElementById('LOGOSPRITE');
        if (LOGOSPRITE) {
            spriteRef.current = LOGOSPRITE;
            const boxElements = logoMarqueeRef.current.children;
            const children = LOGOSPRITE.children;
            console.log(children)
            const newBoxes = Array.from(children).map(child => box(child));
            setBoxes(newBoxes);
            setIsBoxesReady(true);
        }
    }, []);
    return (
        <div className={Styles.marqueeContainer}>
            <LogoSprite />
            <div className={Styles.marquee} ref={logoMarqueeRef}>
                {clones && boxes && boxes.map((box, index) => box)}
            </div>
            <div className={Styles.cover}>

            </div>
        </div>
    );
};

export default LogoMarquee;