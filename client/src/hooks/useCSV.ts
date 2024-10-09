import React, { SetStateAction, useState } from 'react';
import { fetchCsvData, postCsvData } from '../api';
import { parseAddress } from '../utils/parseAddress';
import { Article, Order, SelectedArticle } from '../types';

interface useCSVProps {
    articles: Article[],
    selectedOrder: Order | undefined,
    setMessage: React.Dispatch<SetStateAction<string>>
}

export const useCSV = ({ selectedOrder, articles, setMessage }: useCSVProps) => {
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [showCsv, setShowCsv] = useState<boolean>(false);

    const handleGenerateCSV = async (updatedSelectedArticles: SelectedArticle[]) => {
        if (!selectedOrder) return;
        const csvRows: string[] = [];

        const parsedAdress = parseAddress(selectedOrder.Adresse);
        const customerInfo = `${selectedOrder.Kundenname};${parsedAdress.streetAndNumber};${parsedAdress.postalCode};${parsedAdress.city};${selectedOrder.Auftragsnummer}`;

        updatedSelectedArticles.forEach((selectedArticle: { articleNumber: string; quantity: any; }) => {
            const article = articles.find(a => a.Artikel === selectedArticle.articleNumber);
            console.log(article);
            if (article) {
                const row = `${customerInfo};${selectedArticle.articleNumber};${article.Artikelname};${selectedArticle.quantity};;${selectedOrder.GASBarcode};${selectedArticle.articleNumber}`;
                csvRows.push(row);
            }
        });

        const csvData = csvRows.join('\n');
        localStorage.setItem('csvData', csvData);

        try {
            await postCsvData(csvData);
            setMessage('Retoure erfolgreich angelegt!')
        } catch (error) {
            setMessage('Fehler beim Anlegen der Retoure!');
            console.error(error);
        }
    };

    const loadCsvData = async () => {
        try {
          const csvText = await fetchCsvData();
          const rows = csvText.split('\n').map(row => row.split(';'));
          setCsvData(rows);
          setShowCsv(true);
        } catch (error) {
          console.error('Fehler beim Laden der CSV-Daten!');
        }
      };

    return { handleGenerateCSV, loadCsvData, csvData, showCsv, setShowCsv };
};
