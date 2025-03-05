'use client'
// import Styles from './UXPatterns.module.scss';

type UXPatternsProps = {
    children?: React.ReactNode;
};

const UXPatterns: React.FC<UXPatternsProps> = ({ children }) => {
    return (
        <>
            <p>UXPatterns</p>
            {children}
        </>
    );
};

export default UXPatterns