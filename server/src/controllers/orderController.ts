import { Request, Response } from 'express';
import { fetchOrderDetails } from '../models/orderModel';

const emptyOrder = {
  Retourennummer: null,
  Auftragsnummer: null,
  Rechnungsnummer: null,
  Erstelldatum: null,
  Lieferdatum: null,
  Kundenname: null,
  Adresse: null,
  GASBarcode: null,
};

export const getOrder = async (req: Request, res: Response) => {
  const { barcode } = req.params;
  try {
    const result = await fetchOrderDetails(barcode);
    console.log(result);
    if (result.length === 0) {
      return res.json([]);
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler bei der Bestellung:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};