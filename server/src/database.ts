import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  server: process.env.DB_SERVER || '',
  options: {
    encrypt: true, // Falls nötig, je nach SQL Server Konfiguration
    trustServerCertificate: true,
  },
};

async function connectToDatabase() {
    try {
      const pool = await sql.connect(sqlConfig); // `await` notwendig, um die Verbindung zu erhalten
      console.log('Verbindung erfolgreich!');
      return pool;
    } catch (err) {
      console.error('Datenbankverbindung fehlgeschlagen:', err);
    }
  }
  
  export async function queryDatabase(query: string) {
    try {
      const pool = await connectToDatabase(); // Stelle sicher, dass `await` verwendet wird
      if (pool) {
        const request = pool.request(); // Verwende die `request` Methode
        const result = await request.query(query); // Beispielabfrage
        console.log(result);
        return result.recordset;
      }
    } catch (err) {
      console.error('Fehler bei der Abfrage:', err);
      return null
    }
  }
  
module.exports = {
    queryDatabase
}