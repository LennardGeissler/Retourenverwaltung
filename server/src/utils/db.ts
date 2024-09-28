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

export async function queryDatabase(query: string, params: { [key: string]: any }) {
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();
    Object.keys(params).forEach((key) => {
      request.input(key, params[key]);
    });
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Datenbankfehler:', err);
    throw err;
  }
}
