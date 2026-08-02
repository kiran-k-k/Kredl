const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/kredl');
  
  const jobs = await mongoose.connection.collection('jobs').find({ isDeleted: false }).toArray();
  for (const job of jobs) {
    if (job.roleId && job.companyId) {
      await mongoose.connection.collection('jobroles').updateOne(
        { _id: job.roleId },
        { $addToSet: { companiesHiring: job.companyId } }
      );
    }
  }
  
  console.log('Synced companies to job roles!');
  process.exit(0);
}

run().catch(console.error);
