import Avatar from "@/components/avatar/avatar";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
async function getData() {
  const supabase = createClient();
  const {data, count} = await supabase
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
  published_at: string;
}) {
  return (
    <article className="card">
      <Link href={`/dashboard/articles/${data.slug}/edit`}>
        <Image src={data.image} alt={data.headline} width={300} height={200} />
        <h2>{data.headline}</h2>
      </Link>
      <div className="meta">
        <div className="byline">
          <Link href={`/about`}>
            <Avatar
              size="large"
              name={data.author.full_name}
              src={data.author.avatar_url}
            />
            {data.author.full_name}
          </Link>
        </div>
        <time dateTime={data.published_at}>
          {new Date(data.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <p>{data.description}</p>
    </article>
  );
}
export default async function Page() {
  const articles = await getData(); 
  return (
    <div className="grid">
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
    </div>
  );
}
