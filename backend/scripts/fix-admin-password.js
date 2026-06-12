/**
 * One-time script: updates the seeded admin user's password hash
 * to match Admin@123 using bcrypt, then prints confirmation.
 * Run: node backend/scripts/fix-admin-password.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function fixAdminPassword() {
  const password = 'Admin@123';
  const hash = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    "UPDATE User SET password_hash = ? WHERE email = 'admin@govinfo.in'",
    [hash]
  );

  if (result.affectedRows === 0) {
    console.log('❌ Admin user not found. Make sure seed.sql has been run.');
  } else {
    console.log('✅ Admin password updated successfully.');
    console.log('   Email   : admin@govinfo.in');
    console.log('   Password: Admin@123');
  }

  process.exit(0);
}

fixAdminPassword().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
