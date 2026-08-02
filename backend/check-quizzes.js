const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '/Users/kirankishanraokendre/Documents/PROJECTS/Kredl/backend/.env' });

async function checkQuizzes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    
    // Assuming the collection name is 'quizzes'
    const quizzes = await mongoose.connection.collection('quizzes').find({}).toArray();
    
    console.log(`Found ${quizzes.length} quizzes.`);
    console.log(quizzes);
    
    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Error checking quizzes:', error);
    process.exit(1);
  }
}

checkQuizzes();
