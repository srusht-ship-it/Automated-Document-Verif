// Test login endpoint
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    // Test health endpoint first
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data.message);
    
    // Test login with demo credentials
    const loginData = {
      email: 'issuer@demo.com',
      password: 'demo123'
    };
    
    console.log('\n🔐 Testing login with:', loginData.email);
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      console.log('User:', loginResponse.data.data.user.email, '(' + loginResponse.data.data.user.role + ')');
      console.log('Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();