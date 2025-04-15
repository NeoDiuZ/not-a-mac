// Database connection for Supabase PostgreSQL
import { Pool } from 'pg';

// Read environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.nelhjzintdfbrksmvvua.supabase.co:5432/postgres';

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
      text: 'SELECT token FROM setup WHERE id = $1',
      values: [id],
    };
    
    try {
      const result = await pool.query(query);
      return { success: true, rows: result.rows.map(row => ({ refresh_token: row.token })) };
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
      
      // Insert new user
      const insertQuery = {
        text: 'INSERT INTO setup (id) VALUES ($1)',
        values: [id],
      };
      
      await pool.query(insertQuery);
      return { success: true };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error };
    }
  },

  // Store refresh token for a user
  async storeRefreshToken({ id, refreshToken }) {
    const query = {
      text: 'UPDATE setup SET token = $1 WHERE id = $2',
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