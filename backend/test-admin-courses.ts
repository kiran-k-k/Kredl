import axios from 'axios';
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@kredl.dev',
      password: 'Admin@123'
    });
    const token = loginRes.data.accessToken;
    console.log("Got token");
    
    try {
      const courseRes = await axios.get('http://localhost:3001/api/v1/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Courses GET Status:", courseRes.status);
    } catch (e) {
      console.log("Courses GET Error:", e.response?.status, e.response?.data);
    }
  } catch (err) {
    console.error("Error logging in:", err.response?.data || err.message);
  }
}
test();
