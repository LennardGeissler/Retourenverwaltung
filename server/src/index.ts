import express, { Request, Response } from 'express';
import cors from 'cors';
import { queryDatabase } from './database';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Route für Auftragsdaten
app.get('/api/orders/:barcode', async (req: Request, res: Response) => {
  const { barcode } = req.params;

  const query = `
    SELECT DISTINCT 
      rr.cRetoureNr AS Retourennummer,         
      a.kAuftrag AS Auftragsnummer,           
      r.cRechnungsNr AS Rechnungsnummer,     
      a.dErstellt AS Erstelldatum,            
      l.dVersendet AS Lieferdatum,            
      adr.cVorname + ' ' + adr.cName AS Kundenname, 
      adr.cStrasse + ', ' + adr.cPLZ + ' ' + adr.cOrt AS Adresse                 
    FROM 
      Verkauf.tAuftrag a
    INNER JOIN
      Verkauf.tAuftragRechnung ar ON a.kAuftrag = ar.kAuftrag
    INNER JOIN 
      dbo.tRechnung r ON ar.kRechnung = r.kRechnung
    INNER JOIN 
      dbo.tRMRetoure rr ON a.kAuftrag = rr.kBestellung
    INNER JOIN 
      dbo.tLieferschein lf ON a.kAuftrag = lf.kBestellung
    INNER JOIN 
      dbo.tLieferscheinEckdaten l ON lf.kLieferschein = l.kLieferschein
    INNER JOIN 
      Verkauf.tAuftragAdresse adr ON a.kAuftrag = adr.kAuftrag
    WHERE
      a.kAuftrag = '${barcode}';
  `;

  try {
    const result = await queryDatabase(query) || [];
    if (result.length === 0) {
      return res.status(404).json({ message: 'Keine Daten gefunden.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler bei der Abfrage:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Route für Artikeldaten
app.get('/api/articles/:orderNumber', async (req: Request, res: Response) => {
  const { orderNumber } = req.params;

  const query = `
    SELECT DISTINCT
      ap.cArtNr AS Artikel,
      ap.cName AS Artikelname,
      ap.fAnzahl AS Anzahl
    FROM 
      Verkauf.tAuftrag a
    JOIN 
      Verkauf.tAuftragPosition ap ON a.kAuftrag = ap.kAuftrag
    WHERE 
      a.kAuftrag = '${orderNumber}'
    AND
      ap.nType = 1;
  `;

  try {
    const result = await queryDatabase(query) || [];
    if (result.length === 0) {
      return res.status(404).json({ message: 'Keine Artikel gefunden.' });
    }
    res.json(result);
  } catch (error) {
    console.error('Fehler bei der Abfrage:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://${process.env.DB_SERVER}:${port}`);
});
