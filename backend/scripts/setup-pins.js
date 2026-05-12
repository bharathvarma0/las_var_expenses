const bcrypt = require('bcrypt');
const readline = require('readline');
const pool = require('../database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupPins() {
  console.log('\n=== PIN Setup for Access Groups ===\n');

  try {
    // Get PIN for Lasya & Bharath group
    const pin1 = await question('Enter 4-digit PIN for Lasya & Bharath group: ');
    if (pin1.length !== 4 || !/^\d{4}$/.test(pin1)) {
      console.error('❌ PIN must be exactly 4 digits');
      process.exit(1);
    }

    // Get PIN for Bhagavan
    const pin2 = await question('Enter 4-digit PIN for Bhagavan: ');
    if (pin2.length !== 4 || !/^\d{4}$/.test(pin2)) {
      console.error('❌ PIN must be exactly 4 digits');
      process.exit(1);
    }

    if (pin1 === pin2) {
      console.error('❌ PINs must be different');
      process.exit(1);
    }

    console.log('\n🔐 Hashing PINs...');

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
    console.log('   - Lasya & Bharath group: ****');
    console.log('   - Bhagavan: ****');
    console.log('\nYou can now use these PINs to login.\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await pool.end();
  }
}

setupPins();
