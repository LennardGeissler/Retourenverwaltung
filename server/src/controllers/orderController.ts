import { Request, Response } from 'express';
import { fetchOrderDetails } from '../models/orderModel';

export const getOrder = async (req: Request, res: Response) => {
  const { barcode } = req.params;
  try {
    const result = await fetchOrderDetails(barcode);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Keine Daten gefunden.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler bei der Bestellung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};