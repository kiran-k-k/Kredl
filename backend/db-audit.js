const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

async function runAudit() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const collections = await mongoose.connection.db.listCollections().toArray();
  const report = [];

  for (const colInfo of collections) {
    if (colInfo.name === 'system.profile') continue;
    
    const colName = colInfo.name;
    const collection = mongoose.connection.db.collection(colName);
    
    // 1. Document Count
    const count = await collection.countDocuments();
    
    // 2. Indexes
    const indexes = await collection.indexes();
    
    report.push({
      collection: colName,
      documentCount: count,
      indexCount: indexes.length,
      indexes: indexes.map(i => Object.keys(i.key).join('_')).join(', ')
    });
  }

  // Find Orphan References (Example: Check if Jobs have valid CompanyIds)
  const jobs = await mongoose.connection.db.collection('jobs').find().toArray();
  let orphanJobs = 0;
  for (const job of jobs) {
    const company = await mongoose.connection.db.collection('companies').findOne({ _id: job.companyId });
    if (!company) orphanJobs++;
  }

  const output = {
    collections: report,
    orphans: {
      jobsWithoutCompany: orphanJobs
    }
  };

  fs.writeFileSync('db_audit_results.json', JSON.stringify(output, null, 2));
  console.log('Audit complete. Wrote to db_audit_results.json');
  process.exit(0);
}

runAudit().catch(console.error);
