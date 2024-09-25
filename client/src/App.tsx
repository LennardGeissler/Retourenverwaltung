import React, { useState, useRef, useEffect } from 'react';
import './App.scss';

interface Order {
  Retourennummer: string,
  Auftragsnummer: number,
  Rechnungsnummer: string,
  Erstelldatum: Date,
  Lieferdatum: Date,
  Kundenname: string,
  Adresse: string,
}

interface Article {
  Artikel: string,
  Artikelname: string,
  Anzahl: number,
  Retourenstatus: string,
  Rueckgabegrund: 'Keine Angabe',
  articleNumber: string,
}

interface SelectedArticle {
  articleNumber: string;
  quantity: number;
}

interface AddressParts {
  streetAndNumber: string;
  postalCode: string;
  city: string;
}

const fetchData = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Fetch Error');
  return response.json();
};

const App: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order[]>([]);
  const [showArticles, setShowArticles] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);
  const [inputMode, setInputMode] = useState<'order' | 'article'>('order');
  const [message, setMessage] = useState<string | null>('');

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
      if (showArticles) {
        setBarcode('');
      }
    }
  }, [showArticles]);

  const fetchOrders = async (barcode: string) => {
    try {
      const data = await fetchData(`http://localhost:5000/api/orders/${barcode}`);
      setOrders(data);
      setShowArticles(false);
      setSelectedArticles([]);

      if (data.length === 1) {
        setSelectedOrder(data);
        fetchArticles(data[0].Auftragsnummer.toString());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArticles = async (orderNumber: string) => {
    try {
      const data = await fetchData(`http://localhost:5000/api/articles/${orderNumber}`);
      const updatedArticles = data.map((article: { cBarcode: any }) => ({
        ...article,
        Rueckgabegrund: 'Keine Angabe',
        articleNumber: article.cBarcode,
      }));

      setArticles(updatedArticles);
      setShowArticles(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    setShowArticles(false);
    setOrders([]);
    setArticles([]);
    setBarcode('');
    setInputMode('order');
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder([order]);
    fetchArticles(order.Auftragsnummer.toString());
  };

  const toggleSelectArticle = (articleNumber: string, action: 'increase' | 'decrease') => {
    setSelectedArticles((prev) => {
      const existingArticle = prev.find(a => a.articleNumber === articleNumber);
      const article = articles.find(a => a.Artikel === articleNumber);

      if (existingArticle && article) {
        const updatedSelected = prev.map(a => {
          if (a.articleNumber === articleNumber) {
            const newQuantity = action === 'increase' ? a.quantity + 1 : a.quantity - 1;
            return { ...a, quantity: Math.max(0, Math.min(newQuantity, article.Anzahl)) };
          }
          return a;
        });
        checkAllArticlesSelected(updatedSelected);
        return updatedSelected;
      } else if (article && action === 'increase') {
        const newSelected = [...prev, { articleNumber, quantity: 1 }];
        checkAllArticlesSelected(newSelected);
        return newSelected;
      }
      return prev;
    });
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);

    if (showArticles && inputMode === 'article') {
      const articleToSelect = articles.find(article => article.Artikel === value);
      if (articleToSelect) {
        toggleSelectArticle(articleToSelect.Artikel, 'increase');
      }
    } else if (inputMode === 'order') {
      fetchOrders(value);
      setInputMode('article');
    }
    setBarcode('');
  };

  const generateCSV = async (updatedSelectedArticles: SelectedArticle[]) => {
    const csvRows: string[] = [];

    if (selectedOrder) {
      console.log(selectedOrder)
      const parsedAdress = parseAddress(selectedOrder[0].Adresse);
      const customerInfo = `${selectedOrder[0].Kundenname};${parsedAdress.streetAndNumber};${parsedAdress.postalCode};${parsedAdress.city};${selectedOrder[0].Auftragsnummer}`;

      updatedSelectedArticles.forEach((selectedArticle: { articleNumber: string; quantity: any; }) => {
        const article = articles.find(a => a.Artikel === selectedArticle.articleNumber);
        if (article) {
          const row = `${customerInfo};${selectedArticle.articleNumber};${article.Artikelname};${selectedArticle.quantity};;;${selectedArticle.articleNumber}`;
          csvRows.push(row);
        }
      });

      const csvData = csvRows.join('\n');
      localStorage.setItem('csvData', csvData);

      try {
        const response = await fetch('http://localhost:5000/api/append-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData }),
        });

        if (!response.ok) throw new Error('Fehler beim Anhängen der Daten');

        setMessage('Retoure erfolgreich angelegt!')
      } catch (error) {
        setMessage('Fehler beim Anlegen der Retoure!');
        console.error(error);
      }
    };
  };

  let csvGenerated = false;

  const checkAllArticlesSelected = async (updatedSelectedArticles: SelectedArticle[]) => {
    let allSelected = true;

    articles.forEach((article) => {
      const selectedArticle = updatedSelectedArticles.find(a => a.articleNumber === article.Artikel);
      const selectedQuantity = selectedArticle ? selectedArticle.quantity : 0;

      if (selectedQuantity !== article.Anzahl) {
        allSelected = false;
      }
    });

    if (allSelected && updatedSelectedArticles.length > 0 && !csvGenerated) {
      csvGenerated = true;
      await generateCSV(updatedSelectedArticles);
      handleBack();
    } else if (!allSelected) {
      csvGenerated = false;
    }
  };

  const parseAddress = (address: string): AddressParts => {
    const parts = address.split(',').map(part => part.trim());
    console.log(address, parts)

    if (parts.length < 2) {
      throw new Error('Die Adresse hat nicht das erwartete Format.');
    }

    const streetAndNumber = parts.slice(0, parts.length - 1).join(', ');
    const lastPart = parts[parts.length - 1];
    const postalCodeMatch = lastPart.split(' ');

    if (!postalCodeMatch) {
      throw new Error('PLZ und Ort konnten nicht extrahiert werden.');
    }

    const postalCode = postalCodeMatch[0];
    const city = postalCodeMatch.slice(1).join(' ')

    return {
      streetAndNumber,
      postalCode,
      city,
    };
  };

  return (
    <div className="app">
      <h1>Retourenverwaltung</h1>
      <div className="menu">
        <input
          type="text"
          ref={barcodeInputRef}
          value={barcode}
          onChange={handleBarcodeChange}
          placeholder={showArticles ? 'Artikelnummer scannen' : 'Barcode scannen'}
        />
        <h3 style={message == 'Retoure erfolgreich angelegt!' ? { color: '#4caf50' } : { color: '#ff9999' }}>{message}</h3>
      </div>

      {!showArticles ? (
        <>
          <table>
            <thead>
              <tr>
                <th>Retourennummer</th>
                <th>Auftragsnummer</th>
                <th>Rechnungsnummer</th>
                <th>Erstelldatum</th>
                <th>Lieferdatum</th>
                <th>Kundenname</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} onClick={() => handleOrderClick(order)}>
                  <td>{order.Retourennummer}</td>
                  <td>{order.Auftragsnummer}</td>
                  <td>{order.Rechnungsnummer}</td>
                  <td>{new Date(order.Erstelldatum).toLocaleDateString()}</td>
                  <td>{new Date(order.Lieferdatum).toLocaleDateString()}</td>
                  <td>{order.Kundenname}</td>
                  <td>{order.Adresse}</td>
                </tr>
              ))}
              {orders.length < 14 && Array.from({ length: 14 - orders.length }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td colSpan={7}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Art.-Nr.</th>
                <th>Artikelname</th>
                <th>Menge</th>
                <th>Retourenstatus</th>
                <th>Rückgabegrund</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => {
                const selectedArticle = selectedArticles.find(a => a.articleNumber === article.Artikel);
                const selectedCount = selectedArticle ? selectedArticle.quantity : 0;
                return (
                  <tr key={article.Artikel}>
                    <td>{article.Artikel}</td>
                    <td>{article.Artikelname}</td>
                    <td>{article.Anzahl}</td>
                    <td>{article.Retourenstatus}</td>
                    <td>{article.Rueckgabegrund}</td>
                    <td className="select-article">
                      <button onClick={() => toggleSelectArticle(article.Artikel, 'decrease')} disabled={selectedCount <= 0}>-</button>
                      <span>{selectedCount} / {article.Anzahl}</span>
                      <button onClick={() => toggleSelectArticle(article.Artikel, 'increase')} disabled={selectedCount >= article.Anzahl}>+</button>
                    </td>
                  </tr>
                );
              })}
              {Array.from({ length: 14 - articles.length }).map((_, index) => (
                <tr key={`empty-article-${index}`}>
                  <td colSpan={6}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="button-group">
            <button onClick={handleBack} className='cmd-back'>Zurück</button>
            <button
              onClick={() => {
                generateCSV(selectedArticles)
                handleBack();
              }}
              className='cmd-submit'>Bestätigung</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
