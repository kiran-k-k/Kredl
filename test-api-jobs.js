const axios = require('axios');
async function run() {
  try {
    const res = await axios.get('http://localhost:3001/api/v1/companies?limit=200');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
run();
