import { Request, Response } from 'express';
import { fetchArticleDetails } from '../models/articleModel';

export const getArticles = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  try {
    const result = await fetchArticleDetails(orderNumber);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Keine Artikel gefunden.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler bei den Artikeln:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};