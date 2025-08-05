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
  const [isAuthenticated, setIsAuthenticated] = useState(true);
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
    try {
      const response = await fetch('/api/articles');
      if (response.status === 401) {
        // User is not authenticated, show login prompt
        console.log('User not authenticated, please log in');
        setArticles([]);
        setIsAuthenticated(false);
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArticles(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]);
      setIsAuthenticated(false);
    }
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
      {!isAuthenticated && (
        <div className={styles.authMessage}>
          <p>Please log in to view your articles.</p>
        </div>
      )}
      {Object.entries(groupedArticles).map(([status, articles]) => (
        <div key={status} className={styles.group}>
          <button onClick={() => toggleGroup(status)} tabIndex={0}>
            {expandedGroups[status] ? '▼' : '►'} {status}
          </button>
          {expandedGroups[status] && (
            <ul>
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => onSelectArticle(article)}
                  tabIndex={0}
                >
                  {article.headline || 'Untitled'}
                </button>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
