'use client'
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type TemplateProps = {
    children: React.ReactNode;
};


const Template: React.FC<TemplateProps> = ({ children }) => {
    const ref = useRef(null);

    useGSAP(() => {
        gsap.to(ref.current, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: .5, 
            ease: "power2.inOut",
        }
        )
    });
    return (
        <main ref={ref}>
            {children}
        </main>
    );
};

export default Template;