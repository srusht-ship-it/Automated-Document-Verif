const { User } = require('../models');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding database with demo users...');

    // Demo users
    const demoUsers = [
      {
        email: 'issuer@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'issuer',
        firstName: 'Demo',
        lastName: 'Issuer',
        organization: 'Demo University'
      },
      {
        email: 'individual@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'individual',
        firstName: 'Demo',
        lastName: 'Individual',
        organization: null
      },
      {
        email: 'verifier@demo.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'verifier',
        firstName: 'Demo',
        lastName: 'Verifier',
        organization: 'Demo Corporation'
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created demo user: ${userData.email}`);
      } else {
        console.log(`⚠️ User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();