import React, { useState, useRef, useEffect } from 'react';
import CSVTable from './components/CsvTable';
import ArticlesTable from './components/ArticlesTable';
import OrdersTable from './components/OrdersTable';
import ButtonGroup from './components/ButtonGroup';
import { Article, SelectedArticle, Order } from './types';
import { moveCsvFile } from './api';
import './App.scss';
import { useOrders } from './hooks/useOrders';
import { useArticles } from './hooks/useArticles';
import { useCSV } from './hooks/useCSV';

const App: React.FC = () => {
  const [barcode, setBarcode] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [showArticles, setShowArticles] = useState<boolean>(false);
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>([]);
  const [inputMode, setInputMode] = useState<'order' | 'article'>('order');
  const [message, setMessage] = useState<string>('');

  const { handlefetchArticles } = useArticles({ setArticles, setShowArticles, setMessage })
  const { handlefetchOrders } = useOrders({ setOrders, setShowArticles, setSelectedArticles, setSelectedOrder, handlefetchArticles });
  const { handleGenerateCSV, loadCsvData, csvData, showCsv, setShowCsv } = useCSV({ selectedOrder, articles, setMessage });

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
      if (showArticles) {
        setBarcode('');
      }
    }
  }, [showArticles]);

  const handleBack = () => {
    setShowArticles(false);
    setOrders([]);
    setArticles([]);
    setBarcode('');
    setInputMode('order');
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    handlefetchArticles(order.Auftragsnummer.toString());
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
      handlefetchOrders(value);
      setInputMode('article');
    }
    setBarcode('');
  };

  let csvGenerated = false;

  const checkAllArticlesSelected = async (updatedSelectedArticles: SelectedArticle[]) => {
    const allSelected = articles.every(article => {
      const selectedQuantity = updatedSelectedArticles.find(a => a.articleNumber === article.Artikel)?.quantity || 0;
      return selectedQuantity === article.Anzahl;
    });

    if (allSelected && updatedSelectedArticles.length > 0 && !csvGenerated) {
      csvGenerated = true;
      await handleGenerateCSV(updatedSelectedArticles);
      handleBack();
    } else if (!allSelected) {
      csvGenerated = false;
    }
  };

  const handleCompleteReturns = async () => {
    if (window.confirm("Möchten Sie die Retouren wirklich abschließen?")) {
      await moveCsvFile()
    };
  };

  const handleCloseApp = () => {
    if (window.confirm("Möchten Sie die Anwendung wirklich schließen?")) {
      window.close()
    };
  };

  const handleAddReturn = () => {
    handleGenerateCSV(selectedArticles)
    handleBack();
  }

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
        <h3 style={message == 'Retoure erfolgreich angelegt!' || message == 'Retouren erfolgreich abgeschlossen!' ? { color: '#4caf50' } : { color: '#ff9999' }}>{message}</h3>
      </div>

      {!showCsv ? (
        <>
          {!showArticles ? (
            <>
              <OrdersTable orders={orders} handleOrderClick={handleOrderClick} />
              <ButtonGroup
                buttons={[
                  { label: 'Schließen', onClick: handleCloseApp, className: 'cmd-close' },
                  { label: 'Historie anzeigen', onClick: loadCsvData, className: 'cmd-history' },
                  { label: 'Retouren abschließen', onClick: handleCompleteReturns, className: 'cmd-complete' }
                ]}
              />
            </>
          ) : (
            <>
              <ArticlesTable articles={articles} selectedArticles={selectedArticles} toggleSelectArticle={toggleSelectArticle} />
              <ButtonGroup
                buttons={[
                  { label: 'Zurück', onClick: handleBack, className: 'cmd-back' },
                  { label: 'Bestätigung', onClick: handleAddReturn, className: 'cmd-complete' },
                ]}
              />
            </>
          )}
        </>
      ) : (
        <>
          <CSVTable csvData={csvData} />
          <ButtonGroup
            buttons={[
              { label: 'Zurück zur Übersicht', onClick: () => setShowCsv(false), className: 'cmd-back' },
              { label: 'Retouren abschließen', onClick: handleCompleteReturns, className: 'cmd-complete' },
            ]}
          />
        </>
      )
      }
    </div >
  );
};

export default App;