type SvgIllustrationProps = {
    name: string;
};

const SvgIllustration: React.FC<SvgIllustrationProps> = ({ name }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"  
        >
            <use xlinkHref={`#${name}`} />
        </svg>
    );
};

export default SvgIllustration;