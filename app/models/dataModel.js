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
      let type = 'DB_UNKNOWN';
      if (error.code === 'ENOTFOUND') type = 'DB_HOST_UNREACHABLE';
      else if (error.code === 'ECONNREFUSED') type = 'DB_CONNECTION_REFUSED';

      return { 
        success: false, 
        error: {
          type,
          message: error.message,
          code: error.code,
        }
      };
    }
  },

  // Register a new user
  async registerUser({ id }) {
    try {
      // 1. Check if user already exists
      const checkQuery = {
        text: 'SELECT id FROM setup WHERE id = $1',
        values: [id],
      };
      const existingUser = await pool.query(checkQuery);
  
      if (existingUser.rows.length > 0) {
        return { success: false, message: 'User already exists' };
      }
  
      // 2. Insert new user with empty token
      const insertQuery = {
        text: 'INSERT INTO setup (id, refresh_token) VALUES ($1, $2)',
        values: [id, ''],
      };
      await pool.query(insertQuery);
  
      return { success: true };
    } catch (error) {
      let type = 'DB_UNKNOWN';
      switch (error.code) {
        case 'ENOTFOUND':
          type = 'DB_HOST_UNREACHABLE';
          break;
        case 'ECONNREFUSED':
          type = 'DB_CONNECTION_REFUSED';
          break;
        case '28P01':
          type = 'DB_AUTHENTICATION_FAILED';
          break;
        case '57P01':
          type = 'DB_CONNECTION_LOST';
          break;
        // add more mappings here as you discover other error codes
      }
  
      return {
        success: false,
        error: {
          type,
          message: error.message,
          code: error.code
        }
      };
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
  },

  // Add a user to the waitlist
  async addToWaitlist({ email, name, color, address }) {
    try {
      // 1. Check if email already exists in waitlist
      const checkQuery = {
        text: 'SELECT email FROM waitlist WHERE email = $1',
        values: [email],
      };
      const existingEntry = await pool.query(checkQuery);
  
      if (existingEntry.rows.length > 0) {
        return { success: false, message: 'Email already on waitlist' };
      }
  
      // 2. Insert new waitlist entry
      const insertQuery = {
        text: 'INSERT INTO waitlist (email, name, color, address, created_at) VALUES ($1, $2, $3, $4, NOW())',
        values: [email, name, color, address],
      };
      await pool.query(insertQuery);
  
      return { success: true };
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      return { 
        success: false, 
        error: {
          type: 'DB_ERROR',
          message: error.message,
          code: error.code
        }
      };
    }
  },

  // Get all waitlist entries
  async getWaitlist() {
    try {
      const query = {
        text: 'SELECT * FROM waitlist ORDER BY created_at DESC',
      };
      const result = await pool.query(query);
      
      return { success: true, entries: result.rows };
    } catch (error) {
      console.error('Error getting waitlist:', error);
      return { 
        success: false, 
        error: {
          type: 'DB_ERROR',
          message: error.message,
          code: error.code
        }
      };
    }
  }
};

export default dataModel;