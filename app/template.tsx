"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type TemplateProps = {
    children: React.ReactNode;
};

const Template: React.FC<TemplateProps> = ({ children }) => {
    const ref = useRef(null);
    const handleSelectionChange = useRef(null);

    useEffect(() => {
        if (!handleSelectionChange.current) {
            handleSelectionChange.current = () => {
                const selection = document.getSelection();
                if (selection && "" === selection.toString()) {
                    const rootElement = document.documentElement;
                    const isDarkTheme = window.matchMedia(
                        "(prefers-color-scheme: dark)"
                    ).matches;

                    // LAB color space
                    // const lightnessForLAB = isDarkTheme ? [90, 5] : [5, 90];
                    // const positiveNegative = Math.random() < 0.5 ? -1 : 1;
                    // const randomPercent = () => Math.floor(Math.random() * 100 * positiveNegative);
                    // const val1 = randomPercent();
                    // const val2 = randomPercent();
                    // const background = `lab(${lightnessForLAB[1]}% ${val1}% ${val2}%)`;
                    // const foreground = `lab(${lightnessForLAB[0]}% ${val1}% ${val2}%)`;

                    const colors = [
                        "red",
                        "orange",
                        "yellow",
                        "green",
                        "teal",
                        "blue",
                        "violet",
                    ];
                    const newColorIndex = Math.floor(Math.random() * colors.length);
                    const color = colors[newColorIndex];
                    const val = isDarkTheme ? ["200", "700"] : ["700", "200"];
                    const foreground = `var(--color-core-${color}-${val[0]})`;
                    const background = `var(--color-core-${color}-${val[1]})`;
                    rootElement.style.setProperty(
                        "--color-foreground-highlight",
                        foreground
                    );
                    rootElement.style.setProperty(
                        "--color-background-highlight",
                        background
                    );
                }
            };
        }
        document.addEventListener("selectionchange", handleSelectionChange.current);

        return () => {
            document.removeEventListener(
                "selectionchange",
                handleSelectionChange.current
            );
        };
    }, []);

    useGSAP(() => {
        gsap.to(ref.current, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power2.inOut",
        });
    }, []);

    return <main ref={ref}>{children}</main>;
};

export default Template;
