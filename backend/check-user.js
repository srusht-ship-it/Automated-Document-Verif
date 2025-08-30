// Check user data and password
const User = require('./src/models/User');
const { sequelize } = require('./src/config/database');

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const user = await User.findOne({ where: { email: 'issuer@demo.com' } });
    
    if (user) {
      console.log('✅ User found:', user.email);
      console.log('Role:', user.role);
      console.log('Password hash exists:', user.password ? 'Yes' : 'No');
      
      // Test password comparison
      const isValid = await user.comparePassword('demo123');
      console.log('Password "demo123" is valid:', isValid);
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUser();