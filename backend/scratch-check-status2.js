const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster';

async function main() {
  await mongoose.connect(MONGODB_URI);
  
  const coursesCollection = mongoose.connection.collection('courses');
  const courses = await coursesCollection.find({ isDeleted: { $ne: true } }).toArray();
  
  console.log("=== COURSES ===");
  courses.forEach(c => console.log(`ID: ${c._id}, Title: ${c.title}, Status: ${c.status}, isPublished: ${c.isPublished}`));

  await mongoose.disconnect();
}

main().catch(console.error);
