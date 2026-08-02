const mongoose = require('mongoose');
const uri = "mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const lessons = await db.collection('lessons').find({}).toArray();
  for (const l of lessons) {
    if (typeof l.moduleId === 'string') {
      console.log(`Fixing ${l.title}`);
      await db.collection('lessons').updateOne(
        { _id: l._id },
        { $set: { moduleId: new mongoose.Types.ObjectId(l.moduleId) } }
      );
    }
  }
  console.log('Fixed lessons!');
  process.exit(0);
}
run();
