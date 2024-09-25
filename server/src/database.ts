import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  server: process.env.DB_SERVER || '',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function connectToDatabase() {
    try {
      const pool = await sql.connect(sqlConfig);
      console.log('Verbindung erfolgreich!');
      return pool;
    } catch (err) {
      console.error('Datenbankverbindung fehlgeschlagen:', err);
    }
  }
  
  export async function queryDatabase(query: string) {
    try {
      const pool = await connectToDatabase();
      if (pool) {
        const request = pool.request();
        const result = await request.query(query);
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