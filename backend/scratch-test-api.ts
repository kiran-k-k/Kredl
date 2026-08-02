import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@kredl.com', // Let's try admin or test user if we don't have it, wait...
      password: 'password123'
    });
    console.log("Logged in");
  } catch (e) {
    console.error("Login failed", e.response?.data);
  }
}
test();
