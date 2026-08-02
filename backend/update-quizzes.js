const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '/Users/kirankishanraokendre/Documents/PROJECTS/Kredl/backend/.env' });

async function updateQuizzes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    
    // Assuming the collection name is 'quizzes'
    const result = await mongoose.connection.collection('quizzes').updateMany(
      {},
      { $set: { isPublished: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} quizzes.`);
    
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error updating quizzes:', error);
    process.exit(1);
  }
}

updateQuizzes();
