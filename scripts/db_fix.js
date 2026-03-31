const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: '68.178.163.247',
    user: 'devuser_knockster_safety',
    password: 'devuser_knockster_safety',
    database: 'devuser_knockster_safety'
  });

  try {
    console.log("Connected to database. Altering table...");
    await connection.execute("ALTER TABLE user_profiles DROP COLUMN safe_pin, DROP COLUMN danger_pin;");
    console.log("Successfully dropped legacy columns.");
  } catch (err) {
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log("Columns already dropped or do not exist.");
    } else {
      console.error("Error:", err);
    }
  } finally {
    await connection.end();
  }
}

fixDb();
