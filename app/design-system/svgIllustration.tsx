'use client'

type SvgIllustrationProps = {
    name: string;
};

const SvgIllustration: React.FC<SvgIllustrationProps> = ({ name }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
        >
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};

export default SvgIllustration;