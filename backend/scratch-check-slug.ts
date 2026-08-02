import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const course = await mongoose.connection.collection('courses').findOne({ slug: 'full-stack-java-developer' });
  if (course) {
    console.log(`Course Found: ${course.title} (ID: ${course._id})`);
    const modules = await mongoose.connection.collection('coursemodules').find({ courseId: course._id }).toArray();
    console.log(`Found ${modules.length} modules for this course.`);
  } else {
    console.log("Course not found.");
  }
  await mongoose.disconnect();
}
run();
