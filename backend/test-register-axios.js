const axios = require('axios');
async function test() {
  try {
    const data = { firstName: "John", lastName: "User", email: "test@example.com", password: "Password123!" };
    console.log("Sending:", data);
    const res = await axios.post('http://localhost:3001/api/v1/auth/register', data);
    console.log(res.data);
  } catch (err) {
    console.error("400 Error payload:", err.response?.data);
  }
}
test();
