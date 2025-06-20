'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';
import styles from './ArticleList.module.scss';

type ArticleListProps = {
  onSelectArticle: (article: Article) => void;
  articleDefaults: Article;
};

const ArticleList = ({
  onSelectArticle,
  articleDefaults,
}: ArticleListProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [groupedArticles, setGroupedArticles] = useState<{
    [status: string]: Article[];
  }>({});
  const [expandedGroups, setExpandedGroups] = useState<{
    [status: string]: boolean;
  }>({ Drafts: true, Published: true });

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    const groups = articles.reduce(
      (acc, article) => {
        const status = article.status
          ? article.status.charAt(0).toUpperCase() + article.status.slice(1)
          : 'Draft';
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(article);
        return acc;
      },
      {} as { [status: string]: Article[] }
    );
    setGroupedArticles(groups);
  }, [articles]);

  const fetchArticles = async () => {
    const response = await fetch('/api/articles');
    const data = await response.json();
    setArticles(data);
  };

  const handleNewArticle = () => {
    onSelectArticle(articleDefaults);
  };

  const toggleGroup = (status: string) => {
    setExpandedGroups((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Articles</h2>
        <button onClick={handleNewArticle}>New Article</button>
      </div>
      {Object.entries(groupedArticles).map(([status, articles]) => (
        <div key={status} className={styles.group}>
          <h3 onClick={() => toggleGroup(status)}>
            {expandedGroups[status] ? '▼' : '►'} {status}
          </h3>
          {expandedGroups[status] && (
            <ul>
              {articles.map((article) => (
                <li key={article.id} onClick={() => onSelectArticle(article)}>
                  {article.headline || 'Untitled'}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
