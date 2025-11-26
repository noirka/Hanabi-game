import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
   connectionString: process.env.DATABASE_URL
});

export const initDb = async () => {
   try {
      const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
      await pool.query(createUsersTable);
      console.log('✅ Таблиця Users успішно забезпечена (існує).');
   } catch (err) {
      console.error('❌ Помилка ініціалізації бази даних. Перевірте підключення:', err.message);
      process.exit(1);
   }
};

export default pool;