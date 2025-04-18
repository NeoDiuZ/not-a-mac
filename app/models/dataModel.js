// Database connection for Supabase PostgreSQL
import { Pool } from 'pg';

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL;

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase connections
  }
});

const dataModel = {
  // Check if a user has a refresh token
  async checkRefreshToken({ id }) {
    const query = {
      text: 'SELECT refresh_token FROM setup WHERE id = $1',
      values: [id],
    };
    
    try {
      const result = await pool.query(query);
      return { success: true, rows: result.rows.map(row => ({ refresh_token: row.refresh_token })) };
    } catch (error) {
      console.error('Error checking refresh token:', error);
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
  async storeRefreshToken({ id, refreshToken }) {
    const query = {
      text: 'UPDATE setup SET refresh_token = $1 WHERE id = $2',
      values: [refreshToken, id],
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