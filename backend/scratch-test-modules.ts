import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('http://localhost:3001/api/v1/modules?limit=10');
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log(e.response?.data);
  }
}
test();
