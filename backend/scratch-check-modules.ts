import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const total = await mongoose.connection.collection('coursemodules').countDocuments();
  const published = await mongoose.connection.collection('coursemodules').countDocuments({ status: 'published' });
  const draft = await mongoose.connection.collection('coursemodules').countDocuments({ status: 'draft' });
  const other = await mongoose.connection.collection('coursemodules').countDocuments({ status: { $nin: ['published', 'draft'] } });
  
  console.log(`Total Modules: ${total}`);
  console.log(`Published Modules: ${published}`);
  console.log(`Draft Modules: ${draft}`);
  console.log(`Other Status Modules: ${other}`);
  await mongoose.disconnect();
}
run();
