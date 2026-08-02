const mongoose = require('mongoose');
const uri = "mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const modules = await db.collection('coursemodules').find({ isDeleted: { $ne: true } }).toArray();
  const draftModules = modules.filter(m => m.status !== 'published');
  console.log('Non-published Modules:', draftModules.length, draftModules.map(m => m.title + ' (' + m.status + ')'));
  process.exit(0);
}
run();
