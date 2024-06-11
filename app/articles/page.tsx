import ProfileFlag from "@/components/ProfileFlag";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import Styles from "./styles.module.css";
async function getData() {
  const supabase = createClient();
  const { data, count } = await supabase
    .from("articles")
    .select(
      `
    id,
    headline,
    description,
    image,
    slug,
    author(*),
    published_at
    `
    )
    .eq("draft", false)
    .filter("draft", "eq", false)
    .order("published_at", { ascending: false });

  return data;
}
function Card(data: {
  image: string;
  headline: string;
  description: string;
  slug: string;
  author: any;
  published_at?: string;
  created_at?: string;
  id?: number;
}) {
  let { description } = data;
  if (description.length > 240) {
    description = description.slice(0, 240) + "...";
  }
  const date = new Date(
    data.published_at || data.created_at
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <article className="card">
      <div className="media">
        <Link href={`/articles/${data.slug}`}>
          <Image
            src={data.image}
            alt={data.headline}
            width={300}
            height={200}
          />
        </Link>
      </div>
      <div className="meta">
        <ProfileFlag profile={data.author} />
        <small>
          <time dateTime={date}>{date}</time>
        </small>
      </div>
      <div>
        <h5>
          <Link href={`/articles/${data.slug}`}>{data.headline}</Link>
        </h5>
        <p>{description}</p>
      </div>
    </article>
  );
}
export default async function Page() {
  const articles = await getData();
  return (
    <section className={`grid content ${Styles.articleGrid}`}>
      {articles.map((article) => (
        <Card
          key={article.id}
          image={article.image}
          headline={article.headline}
          description={article.description}
          author={article.author}
          slug={article.slug}
          published_at={article.published_at}
        />
      ))}
    </section>
  );
}
