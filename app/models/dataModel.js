// Database connection for Supabase PostgreSQL
import { Pool } from 'pg';

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL;

// Create a PostgreSQL pool with proper SSL handling for both dev and production
let poolConfig = {
  connectionString: DATABASE_URL,
};

// In production environments, SSL is required
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
} else {
  // For local development
  poolConfig.ssl = { rejectUnauthorized: false };
}

console.log('Creating database pool with config:', {
  hasConnectionString: !!poolConfig.connectionString,
  sslConfig: poolConfig.ssl,
  environment: process.env.NODE_ENV
});

const pool = new Pool(poolConfig);

// Test the connection on initialization
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection function
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection failed:', {
      message: err.message,
      code: err.code,
      detail: err.detail
    });
    return false;
  }
}

// Run the test once
testConnection();

const dataModel = {
  // Check if a user has a refresh token
  async checkRefreshToken({ id }) {
    const query = {
      text: 'SELECT refresh_token FROM setup WHERE id = $1',
      values: [id],
    };
    
    try {
      console.log('Attempting database connection with query:', query.text);
      const result = await pool.query(query);
      console.log('Database query successful, received rows:', result.rows.length);
      return { success: true, rows: result.rows.map(row => ({ refresh_token: row.refresh_token })) };
    } catch (error) {
      console.error('Error checking refresh token:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail
      });
      return { success: false, error };
    }
  },

  // Register a new user
  async registerUser({ id }) {
    try {
      // Check if user already exists
      const checkQuery = {
        text: 'SELECT id FROM setup WHERE id = $1',
        values: [id],
      };
      
      const existingUser = await pool.query(checkQuery);
      
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'User already exists' };
      }
      
      // Insert new user with empty token
      const insertQuery = {
        text: 'INSERT INTO setup (id, refresh_token) VALUES ($1, $2)',
        values: [id, ''],
      };
      
      await pool.query(insertQuery);
      return { success: true };
    } catch (error) {
      console.error('Detailed error in registerUser:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail
      });
      return { success: false, error: error.message };
    }
  },

  // Store refresh token for a user
  async storeRefreshToken({ id, refresh_token }) {
    const query = {
      text: 'UPDATE setup SET refresh_token = $1 WHERE id = $2',
      values: [refresh_token, id],
    };
    
    try {
      await pool.query(query);
      return { success: true };
    } catch (error) {
      console.error('Error storing refresh token:', error);
      return { success: false, error };
    }
  }
};

export default dataModel;