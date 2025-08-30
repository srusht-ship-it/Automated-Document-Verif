// Recreate users with proper password hashing
const User = require('./src/models/User');
const { sequelize } = require('./src/config/database');

async function recreateUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Delete existing demo users
    await User.destroy({ where: { email: ['issuer@demo.com', 'individual@demo.com', 'verifier@demo.com'] } });
    console.log('🗑️ Deleted existing demo users');

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
        const user = await User.create(userData);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        
        // Test password immediately
        const isValid = await user.comparePassword('demo123');
        console.log(`   Password test: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
      } catch (error) {
        console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    console.log('\n🎯 Demo users recreated with proper password hashing!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

recreateUsers();