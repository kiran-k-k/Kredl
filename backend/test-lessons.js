const mongoose = require('mongoose');
const uri = "mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const lessons = await db.collection('lessons').find({ isDeleted: { $ne: true } }).toArray();
  const modules = await db.collection('coursemodules').find({ isDeleted: { $ne: true } }).toArray();
  
  let validLessonCount = 0;
  for (const l of lessons) {
    const mod = modules.find(m => m._id.toString() === l.moduleId.toString());
    if (mod) {
      console.log(`- ${l.title} (Module: ${mod.title})`);
      validLessonCount++;
    } else {
      console.log(`- ${l.title} (ORPHANED, moduleId: ${l.moduleId})`);
    }
  }
  console.log(`Total valid lessons: ${validLessonCount}`);
  process.exit(0);
}
run();
