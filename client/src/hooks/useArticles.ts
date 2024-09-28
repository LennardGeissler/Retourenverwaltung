import React, { SetStateAction, useState } from 'react';
import { fetchArticles } from '../api';
import { Article, SelectedArticle } from '../types';

interface useArticlesProps {
  setSelectedArticles: React.Dispatch<SetStateAction<SelectedArticle[]>>,
  setShowArticles: (showArticles: boolean) => void,
  setMessage: React.Dispatch<SetStateAction<string>>,
}

export const useArticles = ({ setShowArticles, setMessage }: useArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);

  const handlefetchArticles = async (orderNumber: string) => {
    try {
      const data = await fetchArticles(orderNumber);
      const updatedArticles = data.map((article: { cBarcode: any }) => ({
        ...article,
        Rueckgabegrund: 'Keine Angabe',
        articleNumber: article.cBarcode,
      }));

      setArticles(updatedArticles);
      setShowArticles(true);
      setMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return { handlefetchArticles, articles, setArticles };
};
