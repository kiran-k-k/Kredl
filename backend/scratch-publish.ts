import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const result = await mongoose.connection.collection('coursemodules').updateMany(
    {},
    { $set: { status: 'published' } }
  );
  console.log(`Updated ${result.modifiedCount} modules to published status.`);
  await mongoose.disconnect();
}
run();
