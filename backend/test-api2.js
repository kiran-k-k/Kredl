const mongoose = require('mongoose');
const uri = "mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const courseId = '6a509779cd28700a6a29daf0';
  
  const modules = await db.collection('coursemodules').find({ courseId: new mongoose.Types.ObjectId(courseId), isDeleted: { $ne: true } }).toArray();
  const moduleIds = modules.map(m => m._id);
  
  const lessons = await db.collection('lessons').find({
    moduleId: { $in: moduleIds },
    isDeleted: { $ne: true }
  }).toArray();
  
  console.log('Lessons query NOW returns:', lessons.length);
  process.exit(0);
}
run();
