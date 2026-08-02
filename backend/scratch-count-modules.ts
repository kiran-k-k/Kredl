import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const total = await mongoose.connection.collection('coursemodules').countDocuments();
  const deleted = await mongoose.connection.collection('coursemodules').countDocuments({ isDeleted: true });
  const notDeleted = await mongoose.connection.collection('coursemodules').countDocuments({ isDeleted: { $ne: true } });
  
  console.log(`Total: ${total}, Deleted: ${deleted}, Not Deleted: ${notDeleted}`);
  
  const allNotDeleted = await mongoose.connection.collection('coursemodules').find({ isDeleted: { $ne: true } }).toArray();
  allNotDeleted.forEach(m => console.log(`- ${m.title} (Course: ${m.courseId})`));
  await mongoose.disconnect();
}
run();
