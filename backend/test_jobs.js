require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
  
  const activeJobs = await Job.find({ status: 'Active', isDeleted: false }).lean().exec();
  console.log('Total active jobs:', activeJobs.length);
  if(activeJobs.length > 0) {
    console.log('Sample job status:', activeJobs[0].status);
    console.log('Sample job companyId:', activeJobs[0].companyId);
  }
  mongoose.disconnect();
}
test();
