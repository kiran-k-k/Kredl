import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const modules = await mongoose.connection.collection('coursemodules')
    .find()
    .sort({ _id: -1 })
    .limit(20)
    .toArray();
    
  console.log(`Most recent 20 modules:`);
  modules.forEach(m => {
    console.log(`- ${m.title} (Course ID: ${m.courseId})`);
  });
  await mongoose.disconnect();
}
run();
