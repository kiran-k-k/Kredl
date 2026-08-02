const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');

async function getAdminToken() {
  const uri = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('kredl');
  const admin = await db.collection('users').findOne({ role: 'admin' });
  if (!admin) {
    console.log("No admin found");
    return;
  }
  const token = jwt.sign({ sub: admin._id.toString(), role: admin.role, email: admin.email }, 'your-secret-key-for-jwt-keep-it-safe', { expiresIn: '1d' });
  console.log(token);
  await client.close();
}
getAdminToken();
