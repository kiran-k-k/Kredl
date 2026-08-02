import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@kredl.dev',
      password: 'Admin@123'
    });
    
    console.log('Login successful');
    const token = loginRes.data.data.accessToken || loginRes.data.accessToken;
    
    const dashRes = await axios.get('http://localhost:3001/api/v1/admin/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Dashboard data:', Object.keys(dashRes.data));
  } catch (err: any) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
}

test();
