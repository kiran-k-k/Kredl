const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/kredl');
  const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
  
  const distinctIds = await Job.distinct('companyId', { status: 'Active', isDeleted: false }).exec();
  console.log('distinctIds:', distinctIds);
  
  const activeJobs = await Job.find({ status: 'Active', isDeleted: false }).select('companyId').lean().exec();
  console.log('activeJobs:', activeJobs);
  
  mongoose.disconnect();
}
test();
