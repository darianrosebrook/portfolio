import Tiptap from "@/components/tiptap/tiptap";
import { Database } from "app/types/supabase";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/components/avatar/avatar";

export default function EditArticle({
  article,
}: {
  article: Database["public"]["Tables"]["articles"]["Row"];
}) {
  let keyPairs = Object.entries(article).filter(
    (a) => !["articleBody", "author", "image"].includes(a[0])
  );

  return (
    <article className="articleContent">
      <Link href={`/dashboard/articles/${article.slug}/edit`}>Edit</Link>
      <Image
        src={article.image}
        alt={article.headline}
        width={500}
        height={300}
      />
      <h1>{article.headline}</h1>
      <div className="meta">
        <div className="byline">
          <Link href={`/about`}>
            <Avatar
              size="large"
              name={article.author.full_name}
              src={article.author.avatar_url}
            />
            {article.author.full_name}
          </Link>
        </div>
        <time dateTime={article.published_at}>
          {new Date(article.published_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>{" "}
      <h3>Metadata table</h3> 
      <table
        style={{ textAlign: "left", paddingTop: "1rem", paddingRight: "1rem", borderSpacing: "1rem", borderCollapse: "collapse"}}
      >
        <tbody>
          {keyPairs.map((pair, i) => (
            <tr  className="borderTop" key={pair[0]}>
              <th style={{ padding: "1rem" }}>{pair[0]}</th>
              <td style={{ padding: "1rem" }}>{JSON.stringify(pair[1])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Tiptap article={article} />
    </article>
  );
}
