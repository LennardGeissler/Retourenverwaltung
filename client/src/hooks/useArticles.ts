import React, { SetStateAction } from 'react';
import { fetchArticles } from '../api';
import { Article } from '../types';

interface useArticlesProps {
    setArticles: React.Dispatch<SetStateAction<Article[]>>,
    setShowArticles: (showArticles: boolean) => void,
    setMessage: React.Dispatch<SetStateAction<string>>
}

export const useArticles = ({ setArticles, setShowArticles, setMessage }: useArticlesProps) => {
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

    return { handlefetchArticles };
};
