const base_url = `http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api`

const fetchData = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else if (!response.ok) {
    throw new Error('An error occurred');
  }
};

export const fetchOrders = async (barcode: string) => {
  return await fetchData(`${base_url}/orders/${barcode}`);
};

export const fetchArticles = async (orderNumber: string) => {
  return await fetchData(`${base_url}/articles/${orderNumber}`);
};

export const fetchCsvData = async () => {
  const response = await fetch(`${base_url}/csv/get-csv`);
  if (!response.ok) throw new Error('Fetch CSV Error');
  return response.text();
};

export const postCsvData = async (csvData: string) => {
  const response = await fetch(`${base_url}/csv/append-csv`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csvData }),
  });
  if (!response.ok) throw new Error('Fehler beim Anhängen der Daten');
};

export const moveCsvFile = async () => {
  const response = await fetch(`${base_url}/csv/move-csv`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Fehler beim Verschieben der CSV-Datei');
};