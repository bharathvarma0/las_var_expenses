require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function setupPins() {
  console.log('\n=== PIN Setup for Access Groups ===\n');

  try {
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable not set');
      console.error('Please set DATABASE_URL in your deployment platform or .env file');
      process.exit(1);
    }

    // Create pool connection
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      idleTimeoutMillis: 10_000,
    });

    console.log('✓ Connected to database\n');

    // Hardcoded PINs
    const pin1 = '0525'; // Lasya & Bharath
    const pin2 = '9455'; // Bhagavan

    console.log('🔐 Hashing PINs...');

    // Hash the PINs
    const hash1 = await bcrypt.hash(pin1, 10);
    const hash2 = await bcrypt.hash(pin2, 10);

    console.log('💾 Saving to database...');

    // Clear existing access groups
    await pool.query('DELETE FROM access_groups');

    // Insert new access groups
    await pool.query(`
      INSERT INTO access_groups (pin_hash, user_ids, name)
      VALUES ($1, $2, $3)
    `, [hash1, [1, 2], 'Lasya & Bharath']);

    await pool.query(`
      INSERT INTO access_groups (pin_hash, user_ids, name)
      VALUES ($1, $2, $3)
    `, [hash2, [3], 'Bhagavan']);

    console.log('\n✅ PINs configured successfully!');
    console.log('   - Lasya & Bharath PIN: 0525');
    console.log('   - Bhagavan PIN: 9455');
    console.log('\nYou can now use these PINs to login.\n');

    await pool.end();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupPins();
