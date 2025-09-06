// Create demo users for testing
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function createDemoUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synced');

    const demoUsers = [
      {
        email: 'issuer@demo.com',
        password: 'demo123',
        role: 'issuer',
        firstName: 'Demo',
        lastName: 'Issuer',
        organization: 'Demo Organization'
      },
      {
        email: 'individual@demo.com',
        password: 'demo123',
        role: 'individual',
        firstName: 'Demo',
        lastName: 'Individual'
      },
      {
        email: 'verifier@demo.com',
        password: 'demo123',
        role: 'verifier',
        firstName: 'Demo',
        lastName: 'Verifier',
        organization: 'Verification Agency'
      }
    ];

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists`);
        } else {
          await User.create(userData);
          console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        }
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎯 Demo users ready!');
    console.log('You can now login with:');
    console.log('- issuer@demo.com / demo123');
    console.log('- individual@demo.com / demo123');
    console.log('- verifier@demo.com / demo123');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    process.exit(0);
  }
}

createDemoUsers();