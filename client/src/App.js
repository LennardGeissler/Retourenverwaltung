import React, { useState, useRef, useEffect } from 'react';
import './App.scss';
const App = () => {
    const [barcode, setBarcode] = useState('');
    const [orders, setOrders] = useState([]);
    const [articles, setArticles] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState([]);
    const [showArticles, setShowArticles] = useState(false);
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [inputMode, setInputMode] = useState('order');
    const [message, setMessage] = useState('');
    const barcodeInputRef = useRef(null);
    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
            if (showArticles) {
                setBarcode('');
            }
        }
    }, [showArticles]);
    const fetchOrders = async (barcode) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${barcode}`);
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Aufträge');
            }
            const data = await response.json();
            console.log('orders data:', data);
            setOrders(data);
            setShowArticles(false);
            setSelectedArticles([]);
            if (data.length === 1) {
                setSelectedOrder(data);
                fetchArticles(data[0].Auftragsnummer.toString());
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    const fetchArticles = async (orderNumber) => {
        try {
            const response = await fetch(`http://localhost:5000/api/articles/${orderNumber}`);
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Artikel');
            }
            const data = await response.json();
            const updatedArticles = data.map((article) => ({
                ...article,
                Rueckgabegrund: 'Keine Angabe',
                articleNumber: article.cBarcode,
            }));
            setArticles(updatedArticles);
            setShowArticles(true);
        }
        catch (error) {
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
    const handleOrderClick = (order) => {
        console.log('handleOrder');
        setSelectedOrder([order]);
        fetchArticles(order.Auftragsnummer.toString());
    };
    const toggleSelectArticle = (articleNumber) => {
        setSelectedArticles((prev) => {
            const existingArticle = prev.find(a => a.articleNumber === articleNumber);
            const article = articles.find(a => a.Artikel === articleNumber);
            if (existingArticle && article) {
                // Artikel existiert bereits in der Auswahl
                if (existingArticle.quantity < article.Anzahl) {
                    // Erhöhe die Anzahl
                    const updatedSelected = prev.map(a => a.articleNumber === articleNumber
                        ? { ...a, quantity: a.quantity + 1 }
                        : a);
                    checkAllArticlesSelected(updatedSelected); // Überprüfe nach jeder Änderung
                    return updatedSelected;
                }
                else {
                    // Verringere die Anzahl
                    const updatedSelected = prev.map(a => a.articleNumber === articleNumber
                        ? { ...a, quantity: a.quantity - 1 }
                        : a);
                    checkAllArticlesSelected(updatedSelected); // Überprüfe nach jeder Änderung
                    return updatedSelected;
                }
            }
            else if (article) {
                // Füge neuen Artikel zur Auswahl hinzu
                const updatedSelected = [...prev, { articleNumber, quantity: 1 }];
                checkAllArticlesSelected(updatedSelected); // Überprüfe nach jeder Änderung
                return updatedSelected;
            }
            setBarcode('');
            return prev;
        });
    };
    const handleBarcodeChange = (e) => {
        const value = e.target.value;
        setBarcode(value);
        if (showArticles && inputMode === 'article') {
            const articleToSelect = articles.find(article => article.Artikel === value);
            if (articleToSelect) {
                toggleSelectArticle(articleToSelect.Artikel);
            }
        }
        else if (inputMode === 'order') {
            fetchOrders(value);
            setInputMode('article');
        }
        setBarcode('');
    };
    const generateCSV = async (updatedSelectedArticles) => {
        console.log('CSV!');
        const csvRows = [];
        // const header = 'name;address;zip;city;customerFacingNumber;externalArticleId;articleName;quantity;KRT-Nr.;GAS Barcode;articleNumber';
        // csvRows.push(header);
        console.log('Selected Articles:', updatedSelectedArticles);
        if (selectedOrder) {
            console.log(selectedOrder);
            const parsedAdress = parseAddress(selectedOrder[0].Adresse);
            const customerInfo = `${selectedOrder[0].Kundenname};${parsedAdress.streetAndNumber};${parsedAdress.postalCode};${parsedAdress.city};${selectedOrder[0].Auftragsnummer}`;
            updatedSelectedArticles.forEach((selectedArticle) => {
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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ csvData }),
                });
                console.log(response);
                if (!response.ok) {
                    setMessage('Fehler beim Anlegen der Retoure!');
                    throw new Error('Fehler beim Anhängen der Daten');
                }
                console.log('Daten erfolgreich hinzugefügt!');
                setMessage('Retoure erfolgreich angelegt!');
            }
            catch (error) {
                setMessage('Fehler beim Anlegen der Retoure!');
                console.error(error);
            }
        }
        ;
    };
    let csvGenerated = false;
    const checkAllArticlesSelected = async (updatedSelectedArticles) => {
        let allSelected = true;
        articles.forEach((article) => {
            const selectedArticle = updatedSelectedArticles.find((a) => a.articleNumber === article.Artikel);
            const selectedQuantity = selectedArticle ? selectedArticle.quantity : 0;
            if (selectedQuantity !== article.Anzahl) {
                allSelected = false;
            }
        });
        console.log(allSelected);
        if (allSelected && !csvGenerated) { // Überprüfen Sie, ob CSV bereits generiert wurde
            csvGenerated = true; // Setzen Sie das Flag
            await generateCSV(updatedSelectedArticles);
            handleBack();
        }
        else if (!allSelected) {
            csvGenerated = false; // Setzen Sie das Flag zurück, wenn nicht alle ausgewählt sind
        }
    };
    const parseAddress = (address) => {
        // Teile die Adresse am Komma
        const parts = address.split(',').map(part => part.trim());
        console.log(address, parts);
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
        const city = postalCodeMatch.slice(1).join(' ');
        return {
            streetAndNumber,
            postalCode,
            city,
        };
    };
    return (React.createElement("div", { className: "app" },
        React.createElement("h1", null, "Retourenverwaltung"),
        React.createElement("div", { className: "menu" },
            React.createElement("input", { type: "text", ref: barcodeInputRef, value: barcode, onChange: handleBarcodeChange, placeholder: showArticles ? 'Artikelnummer scannen' : 'Barcode scannen' }),
            React.createElement("h3", { style: message == 'Retoure erfolgreich angelegt!' ? { color: '#4caf50' } : { color: '#ff9999' } }, message)),
        !showArticles ? (React.createElement(React.Fragment, null,
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Retourennummer"),
                        React.createElement("th", null, "Auftragsnummer"),
                        React.createElement("th", null, "Rechnungsnummer"),
                        React.createElement("th", null, "Erstelldatum"),
                        React.createElement("th", null, "Lieferdatum"),
                        React.createElement("th", null, "Kundenname"),
                        React.createElement("th", null, "Adresse"))),
                React.createElement("tbody", null,
                    orders.map((order, index) => (React.createElement("tr", { key: index, onClick: () => handleOrderClick(order) },
                        React.createElement("td", null, order.Retourennummer),
                        React.createElement("td", null, order.Auftragsnummer),
                        React.createElement("td", null, order.Rechnungsnummer),
                        React.createElement("td", null, new Date(order.Erstelldatum).toLocaleDateString()),
                        React.createElement("td", null, new Date(order.Lieferdatum).toLocaleDateString()),
                        React.createElement("td", null, order.Kundenname),
                        React.createElement("td", null, order.Adresse)))),
                    orders.length < 16 && Array.from({ length: 16 - orders.length }).map((_, index) => (React.createElement("tr", { key: `empty-${index}` },
                        React.createElement("td", { colSpan: 7 }, "\u00A0")))))))) : (React.createElement(React.Fragment, null,
            React.createElement("table", null,
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Art.-Nr."),
                        React.createElement("th", null, "Artikelname"),
                        React.createElement("th", null, "Menge"),
                        React.createElement("th", null, "Retourenstatus"),
                        React.createElement("th", null, "R\u00FCckgabegrund"),
                        React.createElement("th", null))),
                React.createElement("tbody", null,
                    articles.map((article) => {
                        const selectedArticle = selectedArticles.find(a => a.articleNumber === article.Artikel);
                        const selectedCount = selectedArticle ? selectedArticle.quantity : 0;
                        return (React.createElement("tr", { key: article.Artikel },
                            React.createElement("td", null, article.Artikel),
                            React.createElement("td", null, article.Artikelname),
                            React.createElement("td", null, article.Anzahl),
                            React.createElement("td", null, article.Retourenstatus),
                            React.createElement("td", null, article.Rueckgabegrund),
                            React.createElement("td", { className: "select-article" },
                                React.createElement("div", { className: "checkbox-wrapper-19" },
                                    React.createElement("input", { type: "checkbox", id: `cb-${article.Artikel}`, checked: selectedCount > 0, onChange: () => toggleSelectArticle(article.Artikel) }),
                                    React.createElement("label", { htmlFor: `cb-${article.Artikel}`, className: "check-box" })),
                                React.createElement("span", null,
                                    selectedCount,
                                    " / ",
                                    article.Anzahl))));
                    }),
                    Array.from({ length: 16 - articles.length }).map((_, index) => (React.createElement("tr", { key: `empty-article-${index}` },
                        React.createElement("td", { colSpan: 6 }, "\u00A0")))))),
            React.createElement("div", { className: "button-group" },
                React.createElement("button", { onClick: handleBack, className: 'cmd-back' }, "Zur\u00FCck"),
                React.createElement("button", { onClick: () => {
                        generateCSV(selectedArticles);
                        handleBack();
                    }, className: 'cmd-submit' }, "Best\u00E4tigung"))))));
};
export default App;
