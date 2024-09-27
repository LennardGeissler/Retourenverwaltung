// api.ts
const fetchData = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Fetch Error');
  return response.json();
};

export const fetchOrders = async (barcode: string) => {
  return await fetchData(`http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api/orders/${barcode}`);
};

export const fetchArticles = async (orderNumber: string) => {
  return await fetchData(`http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api/articles/${orderNumber}`);
};

export const fetchCsvData = async () => {
  const response = await fetch(`http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api/get-csv`);
  if (!response.ok) throw new Error('Fetch CSV Error');
  return response.text();
};

export const postCsvData = async (csvData: string) => {
  const response = await fetch(`http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api/append-csv`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csvData }),
  });
  if (!response.ok) throw new Error('Fehler beim Anhängen der Daten');
};

export const moveCsvFile = async () => {
  const response = await fetch('http://localhost:5000/api/move-csv', { 
    method: 'POST', headers: { 'Content-Type': 'application/json' } 
  });
  if (!response.ok) throw new Error('Fehler beim Verschieben der CSV-Datei');
};
