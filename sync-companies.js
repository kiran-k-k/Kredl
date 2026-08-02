const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017/kredl');
  await client.connect();
  const db = client.db('kredl');

  const jobs = await db.collection('jobs').find({ isDeleted: false }).toArray();
  for (const job of jobs) {
    if (job.roleId && job.companyId) {
      await db.collection('jobroles').updateOne(
        { _id: job.roleId },
        { $addToSet: { companiesHiring: job.companyId } }
      );
    }
  }
  
  console.log('Synced companies to job roles!');
  await client.close();
}

run().catch(console.error);
