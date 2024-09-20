import React, { useState } from 'react';
import './App.scss';

const App: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showArticles, setShowArticles] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${barcode}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Aufträge');
      }
      const data = await response.json();
      setOrders(data);
      setShowArticles(false);
      setSelectedArticles(new Set());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchArticles = async (orderNumber: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${orderNumber}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Artikel');
      }
      const data = await response.json();
      setArticles(data);
      setShowArticles(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBack = () => {
    setShowArticles(false); // Gehe zurück zur Auftragsansicht
  };

  const toggleSelectArticle = (articleNumber: string) => {
    setSelectedArticles((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(articleNumber)) {
        newSelection.delete(articleNumber);
      } else {
        newSelection.add(articleNumber);
      }
      return newSelection;
    });
  };

  return (
    <div className="app">
      <h1>Retourenverwaltung</h1>
      <div className="menu">
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barcode scannen"
        />
        <button onClick={fetchOrders}>Auftragsnummer</button>
      </div>

      {!showArticles ? (
        <>
          <h2>Aufträge</h2>
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
              {orders.map((order) => (
                <tr key={order.Auftragsnummer} onClick={() => fetchArticles(order.Auftragsnummer)}>
                  <td>{order.Retourennummer}</td>
                  <td>{order.Auftragsnummer}</td>
                  <td>{order.Rechnungsnummer}</td>
                  <td>{order.Erstelldatum}</td>
                  <td>{order.Lieferdatum}</td>
                  <td>{order.Kundenname}</td>
                  <td>{order.Adresse}</td>
                </tr>
              ))}
              {orders.length < 12 && Array.from({ length: 12 - orders.length }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td colSpan={7}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <h2>Artikel</h2>
          <table>
            <thead>
              <tr>
                <th>Artikelnummer</th>
                <th>Artikelname</th>
                <th>Anzahl</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.Artikel}>
                  <td>{article.Artikel}</td>
                  <td>{article.Artikelname}</td>
                  <td>{article.Anzahl}</td>
                  <td className='select-article'>
                    <div className="checkbox-wrapper-19">
                      <input type="checkbox" id="cbtest-19" />
                      <label htmlFor="cbtest-19" className="check-box" />
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: 12 - articles.length }).map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td colSpan={4}></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleBack} className='cmd-back'>Zurück</button>
        </>
      )}
    </div>
  );
};

export default App;
