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
    (a) => !["articleBody", "author"].includes(a[0])
  );
  const { author, image, articleBody, ...rest } = article;

  return (
    <article className="articleContent">
      <Image
        src={article.image || "/darianrosebrook.jpg"}
        alt={article.headline}
        width={300}
        height={200}
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
        style={{
          textAlign: "left",
          paddingTop: "1rem",
          paddingRight: "1rem",
          borderSpacing: "1rem",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          {keyPairs.map((pair, i) => (
            <tr className="borderTop" key={pair[0]}>
              <th style={{ padding: "1rem" }}>{pair[0]}</th>
              <td style={{ padding: "1rem" }}>
                {pair[1]?.toString().includes("http") ? (
                  <Link href={pair[1].toString()}>{pair[1].toString()}</Link>
                ) : (
                  pair[1] && pair[1].toString()
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Tiptap article={article} />
    </article>
  );
}
