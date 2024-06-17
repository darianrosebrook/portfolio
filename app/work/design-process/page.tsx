import Link from "next/link";
import Styles from "./Page.module.scss";

type PageProps = {};

const Page: React.FC<PageProps> = () => {
  return (
    <section className="content">
      <Link href="/work">Previous</Link>
      <h1>Design Process</h1> 
      <h2>Dual Track Agile</h2>
      
    </section>
  );
};

export default Page;
