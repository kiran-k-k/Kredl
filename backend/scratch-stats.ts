import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const totalCourses = await mongoose.connection.collection('courses').countDocuments({ isDeleted: { $ne: true } });
  const publishedCourses = await mongoose.connection.collection('courses').countDocuments({ isPublished: true, isDeleted: { $ne: true } });
  const draftCourses = await mongoose.connection.collection('courses').countDocuments({ isPublished: false, isDeleted: { $ne: true } });
  
  console.log({ totalCourses, publishedCourses, draftCourses });
  await mongoose.disconnect();
}
run();
