import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@kredl.dev',
      password: 'Admin@123'
    });
    
    console.log('Login successful');
    const token = loginRes.data.data.accessToken || loginRes.data.accessToken;
    
    const meRes = await axios.get('http://localhost:3001/api/v1/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('User profile:', meRes.data.data || meRes.data);
  } catch (err: any) {
    console.error('Error:', err.response?.status, err.response?.data);
  }
}

test();
