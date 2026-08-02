const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found.');
    process.exit(1);
  }
  
  await mongoose.connect(uri);
  const client = mongoose.connection.getClient();
  const db = client.db(process.env.DATABASE_NAME || 'test');
  
  if (!db) throw new Error("DB undefined");
  
  const collectionsToVerify = [
    'companies', 'jobroles', 'jobs', 'users', 'courses', 
    'modules', 'lessons', 'quizzes', 'projects'
  ];
  
  console.log('====================================');
  console.log('INDEX VERIFICATION');
  console.log('====================================\n');

  for (const collName of collectionsToVerify) {
    try {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      console.log(`\n--- Collection: ${collName} ---`);
      console.log(JSON.stringify(indexes, null, 2));
    } catch (e) {
      if (e.codeName === 'NamespaceNotFound') {
         console.log(`\n--- Collection: ${collName} ---`);
         console.log('Collection does not exist in the database.');
      } else {
         console.log(`\n--- Collection: ${collName} ---`);
         console.log('No indexes or collection missing.', e.message);
      }
    }
  }

  console.log('\n====================================');
  console.log('EXPLAIN PLANS');
  console.log('====================================\n');
  
  try {
    const compColl = db.collection('companies');
    const compExplain = await compColl.find({ name: { $regex: 'Audit', $options: 'i' } }).explain('executionStats');
    console.log('\n--- Query: Company search by name ---');
    console.log('Winning Plan:', compExplain.queryPlanner?.winningPlan?.stage);
    console.log('Index Name:', compExplain.queryPlanner?.winningPlan?.indexName || 'NONE');
    console.log('Total Docs Examined:', compExplain.executionStats?.totalDocsExamined);
  } catch (e) { console.log('Explain Companies error:', e.message); }

  try {
    const jobsColl = db.collection('jobs');
    const jobsExplain = await jobsColl.find({ isActive: true, deadline: { $gt: new Date() } }).explain('executionStats');
    console.log('\n--- Query: Job filtering by isActive and deadline ---');
    console.log('Winning Plan:', jobsExplain.queryPlanner?.winningPlan?.stage);
    console.log('Index Name:', jobsExplain.queryPlanner?.winningPlan?.indexName || 'NONE');
    console.log('Total Docs Examined:', jobsExplain.executionStats?.totalDocsExamined);
  } catch (e) { console.log('Explain Jobs error:', e.message); }

  await mongoose.disconnect();
}

run().catch(console.error);
