import { Pool } from 'pg';

// Create a new Pool instance for PostgreSQL connection
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE,
});

export async function executeQuery(query: string, values: any[] = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getTableColumns(tableName: string, schema: string = 'public') {
  const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1 AND table_schema = $2
    ORDER BY ordinal_position;
  `;
  
  return executeQuery(query, [tableName, schema]);
}

export async function getSchemas() {
  const query = `
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
    ORDER BY schema_name;
  `;
  
  return executeQuery(query);
}

export async function getTables(schema: string = 'public') {
  const query = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1
    ORDER BY table_name;
  `;
  
  return executeQuery(query, [schema]);
}