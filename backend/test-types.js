const mongoose = require('mongoose');
const uri = "mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const lessons = await db.collection('lessons').find({ isDeleted: { $ne: true } }).toArray();
  for (const l of lessons) {
    console.log(`- ${l.title} | moduleId type: ${typeof l.moduleId} | isObjectId: ${l.moduleId instanceof mongoose.Types.ObjectId}`);
  }
  process.exit(0);
}
run();
