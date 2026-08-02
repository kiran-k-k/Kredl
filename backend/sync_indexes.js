require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { JobSchema } = require('./dist/modules/jobs/schemas/job.schema.js');
  const Job = mongoose.model('Job', JobSchema);
  
  try {
    await Job.syncIndexes();
    console.log('Indexes synced successfully');
  } catch(e) {
    console.error('Error syncing indexes:', e);
  }
  mongoose.disconnect();
}
test();
