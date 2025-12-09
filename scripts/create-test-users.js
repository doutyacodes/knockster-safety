// FILE LOCATION: scripts/create-test-users.js

/**
 * Quick Test User Creation Script
 * Creates test users with hashed passwords using bcrypt
 * 
 * Run with: node scripts/create-test-users.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database configuration - CHANGE THESE TO MATCH YOUR SETUP
const dbConfig = {
  host: '68.178.163.247',
  user: 'devuser_knockster_safety',
  database: 'devuser_knockster_safety',
  password: 'devuser_knockster_safety',
  port: 3306
};

async function createTestUsers() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected!\n');

    // Test users to create
    // Test users to create
const testUsers = [
  // Existing ones (optional – remove if already created)
  {
    email: 'admin@knockster.com',
    password: 'admin123',
    fullName: 'Admin User',
    phone: '+1234567890',
    roleId: 2, // org_admin
    orgId: 1
  },
  {
    email: 'user@knockster.com',
    password: 'user123',
    fullName: 'Regular User',
    phone: '+1234567891',
    roleId: 4, // user
    orgId: 1
  },
  {
    email: 'john.doe@test.com',
    password: 'password123',
    fullName: 'John Doe',
    phone: '+1234567892',
    roleId: 4,
    orgId: 1
  },

  // 🔥 10 New Generated Users
  {
    email: 'emma.smith@test.com',
    password: 'test1234',
    fullName: 'Emma Smith',
    phone: '+1400000001',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'liam.johnson@test.com',
    password: 'test1234',
    fullName: 'Liam Johnson',
    phone: '+1400000002',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'olivia.brown@test.com',
    password: 'test1234',
    fullName: 'Olivia Brown',
    phone: '+1400000003',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'noah.wilson@test.com',
    password: 'test1234',
    fullName: 'Noah Wilson',
    phone: '+1400000004',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'ava.miller@test.com',
    password: 'test1234',
    fullName: 'Ava Miller',
    phone: '+1400000005',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'ethan.davis@test.com',
    password: 'test1234',
    fullName: 'Ethan Davis',
    phone: '+1400000006',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'mia.garcia@test.com',
    password: 'test1234',
    fullName: 'Mia Garcia',
    phone: '+1400000007',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'lucas.martinez@test.com',
    password: 'test1234',
    fullName: 'Lucas Martinez',
    phone: '+1400000008',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'isabella.hernandez@test.com',
    password: 'test1234',
    fullName: 'Isabella Hernandez',
    phone: '+1400000009',
    roleId: 4,
    orgId: 1
  },
  {
    email: 'jackson.thompson@test.com',
    password: 'test1234',
    fullName: 'Jackson Thompson',
    phone: '+1400000010',
    roleId: 4,
    orgId: 1
  }
];


    console.log('👥 Creating test users...\n');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const [existingUser] = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [userData.email]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Insert user
        const [userResult] = await connection.execute(
          'INSERT INTO users (email, password_hash, status, timezone) VALUES (?, ?, ?, ?)',
          [userData.email, passwordHash, 'active', 'UTC']
        );

        const userId = userResult.insertId;

        // Insert user profile
        await connection.execute(
          'INSERT INTO user_profiles (user_id, full_name, phone) VALUES (?, ?, ?)',
          [userId, userData.fullName, userData.phone]
        );

        // Assign role
        await connection.execute(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [userId, userData.roleId]
        );

        // Link to organization
        const isPrimaryAdmin = userData.roleId === 2 ? 1 : 0;
        await connection.execute(
          'INSERT INTO org_users (org_id, user_id, role_id, is_primary_admin, status) VALUES (?, ?, ?, ?, ?)',
          [userData.orgId, userId, userData.roleId, isPrimaryAdmin, 'active']
        );

        console.log(`✅ Created user: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Role: ${userData.roleId === 2 ? 'Admin' : 'User'}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎉 Done! Test users created successfully!\n');
    console.log('📝 Login Credentials:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ADMIN USER:');
    console.log('   Email:    admin@knockster.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 REGULAR USER:');
    console.log('   Email:    user@knockster.com');
    console.log('   Password: user123');
    console.log('');
    console.log('👤 JOHN DOE:');
    console.log('   Email:    john.doe@test.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Database connection closed.');
    }
  }
}

// Run the script
createTestUsers();