import fs from 'fs';
import path from 'path';
import fsextra from 'fs-extra';
import { Request, Response } from 'express';

const csvFilePath = path.join(__dirname, '../../data.csv');
const archiveDir = path.join(__dirname, '../../../archiv');

export const appendCsv = (req: Request, res: Response) => {
  const csvData = req.body.csvData;

  fs.access(csvFilePath, fs.constants.F_OK, (err) => {
    const isFileExists = !err;

    if (!isFileExists) {
      fs.writeFile(csvFilePath, '', (err) => {
        if (err) {
          return res.status(500).send('Fehler beim Schreiben in die Datei');
        }
        appendCsvData(csvData, res);
      });
    } else {
      appendCsvData(csvData, res);
    }
  });
};

const appendCsvData = (csvData: any, res: Response) => {
  fs.appendFile(csvFilePath, csvData + '\n', (err) => {
    if (err) return res.status(500).send('Fehler beim Schreiben in die Datei');
    res.status(200).send('Daten erfolgreich hinzugefügt');
  });
};

export const getCsv = (req: Request, res: Response) => {
  const todaysDate = formatDate(new Date());
  const fileName = `data_${todaysDate}.csv`;
  const filePath = path.join(archiveDir, fileName);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('CSV-Datei nicht gefunden.');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Fehler beim Lesen der CSV-Datei.');
      res.send(data);
    });
  });
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const moveCsv = async (req: Request, res: Response) => {
  const header = 'name;address;zip;city;customerFacingNumber;externalArticleId;articleName;quantity;KRT-Nr.;GAS Barcode;articleNumber';

  try {
    const todaysDate = formatDate(new Date());
    const destinationPath = path.join(archiveDir, `data_${todaysDate}.csv`);

    if (fs.existsSync(destinationPath)) {
      const data = await fsextra.readFile(csvFilePath, 'utf-8');
      await fsextra.appendFile(destinationPath, data);
      await fsextra.remove(csvFilePath);
    } else {
      const data = await fsextra.readFile(csvFilePath, 'utf-8');
      await fsextra.writeFile(destinationPath, header + '\n' + data);
      await fsextra.remove(csvFilePath);
    }
    res.status(200).json({ message: 'CSV-Datei erfolgreich verschoben/angehängt!', filename: `data_${todaysDate}.csv` });
  } catch (error) {
    console.error('Fehler beim Verschieben/Anhängen der CSV-Datei:', error);
    res.status(500).json({ error: 'Fehler beim Verschieben/Anhängen der CSV-Datei' });
  }
};
