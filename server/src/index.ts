import express, { Request, Response } from 'express';
import cors from 'cors';
import { queryDatabase } from './database';
import dotenv from 'dotenv';
import fs from 'fs';
import fsextra from 'fs-extra';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/orders/:barcode', async (req: Request, res: Response) => {
  const { barcode } = req.params;
  console.log(barcode);

  let query = `
    SELECT DISTINCT 
      rr.cRetoureNr AS Retourennummer,         
      a.cAuftragsNr AS Auftragsnummer,           
      r.cRechnungsNr AS Rechnungsnummer,     
      a.dErstellt AS Erstelldatum,            
      l.dVersendet AS Lieferdatum,            
      adr.cVorname + ' ' + adr.cName AS Kundenname, 
      adr.cStrasse + ', ' + adr.cPLZ + ' ' + adr.cOrt AS Adresse,
      tv.cEnclosedReturnIdentCode AS GASBarcode              
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
    INNER JOIN 
      dbo.tLieferschein tl ON tl.kBestellung = a.kAuftrag
    INNER JOIN
      dbo.tVersand tv ON tv.kLieferschein = tl.kLieferschein
    WHERE
      a.cAuftragsNr = '${barcode}'
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

app.get('/api/articles/:orderNumber', async (req: Request, res: Response) => {
  const { orderNumber } = req.params;

  const query = `
    SELECT DISTINCT
      ap.cArtNr AS Artikel,
      CASE 
          WHEN CHARINDEX('#', ap.cName) > 0 
          THEN SUBSTRING(ap.cName, 1, CHARINDEX('#', ap.cName) - 1)
          ELSE ap.cName
      END AS Artikelname,
      ap.fAnzahl AS Anzahl,
      rss.cName AS Retourenstatus,
      at.cBarcode AS articleNumber
    FROM 
      Verkauf.tAuftrag a
    INNER JOIN 
      Verkauf.tAuftragPosition ap ON a.kAuftrag = ap.kAuftrag
    INNER JOIN 
      dbo.tRMRetoure rr ON a.kAuftrag = rr.kBestellung
	  INNER JOIN
	    dbo.tRMStatus rs ON rr.kRMStatus = rs.kRMStatus
	  INNER JOIN
	    dbo.tRMStatusSprache rss ON rs.kRMStatus = rss.kRMStatus
    INNER JOIN
      dbo.tArtikel at ON ap.cArtNr = at.cArtNr 
    WHERE 
      a.cAuftragsNr = '${orderNumber}'
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

app.post('/api/append-csv', (req, res) => {
  const csvData = req.body.csvData;
  const filePath = path.join(__dirname, 'data.csv');
  console.log(csvData, filePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    const isFileExists = !err;

    if (!isFileExists) {
      fs.writeFile(filePath, '', (err) => {
        if (err) {
          return res.status(500).send('Fehler beim Schreiben in die Datei');
        }
        appendCsvData(filePath, csvData, res);
      });
    } else {
      appendCsvData(filePath, csvData, res);
    }
  });
});

app.get('/api/get-csv', (req, res) => {
  const todaysDate = formatDate(new Date());
  const fileName = `data_${todaysDate}.csv`;
  const filePath = path.join(__dirname, `../../archiv/${fileName}`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('CSV-Datei nicht gefunden.');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Fehler beim Lesen der CSV-Datei.');
      res.send(data);
    });
  });
});

const appendCsvData = (filePath:any, csvData:any, res:any) => {
  fs.appendFile(filePath, csvData + '\n', (err) => {
    if (err) return res.status(500).send('Fehler beim Schreiben in die Datei');
    res.status(200).send('Daten erfolgreich hinzugefügt');
  });
};

const formatDate = (date:Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

app.post('/api/move-csv', async (req, res) => {
  const header = 'name;address;zip;city;customerFacingNumber;externalArticleId;articleName;quantity;KRT-Nr.;GAS Barcode;articleNumber';

  try {
    const todaysDate = formatDate(new Date());
    const sourcePath = path.join(__dirname, 'data.csv');
    const destinationPath = path.join(__dirname, '../../archiv/data_' + todaysDate + '.csv');

    if (fs.existsSync(destinationPath)) {
      const data = await fsextra.readFile(sourcePath, 'utf-8');
      await fsextra.appendFile(destinationPath, data);
      await fsextra.remove(sourcePath);
    } else {
      const data = await fsextra.readFile(sourcePath, 'utf-8');
      await fsextra.writeFile(destinationPath, header + '\n' + data);
      await fsextra.remove(sourcePath);
    }
    res.status(200).json({ message: 'CSV file moved/appended successfully!', filename: `data_${todaysDate}.csv` });
  } catch (error) {
    console.error('Error moving/appending the CSV file:', error);
    res.status(500).json({ error: 'Failed to move/append the CSV file' });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
