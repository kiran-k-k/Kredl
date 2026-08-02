import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  const module = await mongoose.connection.collection('coursemodules').findOne({ title: { $regex: /Java Foundations/i }, isDeleted: { $ne: true } });
  if (!module) {
    console.log('Module 1 not found!');
    return;
  }
  console.log(`Found Module: ${module._id} - ${module.title}`);

  const lessons = await mongoose.connection.collection('lessons').find({ moduleId: module._id, isDeleted: { $ne: true } }).toArray();
  console.log(`Lessons found: ${lessons.length}`);
  lessons.forEach(l => console.log(` - ${l.title}`));

  await mongoose.disconnect();
}
run();
