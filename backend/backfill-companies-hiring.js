const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const Job = mongoose.connection.collection('jobs');
  const JobRole = mongoose.connection.collection('jobroles');

  const jobs = await Job.find({ isDeleted: false }).toArray();
  let updatedCount = 0;
  
  for (const job of jobs) {
    if (job.roleId && job.companyId) {
      const res = await JobRole.updateOne(
        { _id: job.roleId },
        { $addToSet: { companiesHiring: job.companyId } }
      );
      if (res.modifiedCount > 0) {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully backfilled ${updatedCount} job roles with companies from existing jobs.`);
  process.exit(0);
}
run();
