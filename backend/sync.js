const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://localhost:27017/kredl';
  
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');
    const db = mongoose.connection.db;

    const courses = await db.collection('courses').find({}).toArray();
    for (const course of courses) {
      const moduleCount = await db.collection('coursemodules').countDocuments({ courseId: course._id, isDeleted: { $ne: true } });

      const modules = await db.collection('coursemodules').find({ courseId: course._id, isDeleted: { $ne: true } }).toArray();
      const moduleIds = modules.map(m => m._id);

      let lessonCount = 0;
      if (moduleIds.length > 0) {
        lessonCount = await db.collection('lessons').countDocuments({ moduleId: { $in: moduleIds }, isDeleted: { $ne: true } });
      }

      await db.collection('courses').updateOne(
        { _id: course._id },
        { $set: { moduleCount, lessonCount } }
      );
      console.log(`Updated course ${course.slug}: ${moduleCount} modules, ${lessonCount} lessons`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
