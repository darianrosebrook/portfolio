 'use client' 

type PageProps = {
    children?: React.ReactNode;
};

const Page: React.FC<PageProps> = ({ children }) => {
    return (
        <>
            <p>Page</p>
        </>
    );
};

export default Page;