const axios = require('axios');
async function run() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@kredl.dev',
      password: 'Admin@123'
    }, { withCredentials: true });
    
    console.log("Login res data:", loginRes.data);
    const token = loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
    console.log("Token:", token);
    
    // the refresh token is in cookie, but here we can just use the access token
    const meRes = await axios.get('http://localhost:3001/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Me res data:", meRes.data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}
run();
