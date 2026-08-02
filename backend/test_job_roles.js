const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const roles = await db.collection('jobroles').find({}).toArray();
  console.log("Total roles:", roles.length);
  console.log("Roles:");
  roles.forEach(r => console.log(`- ${r.title} (Published: ${r.isPublished})`));
  process.exit(0);
}
run();
