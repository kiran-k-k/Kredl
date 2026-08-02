require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Company = mongoose.model('Company', new mongoose.Schema({}, { strict: false }));
  
  const comps = await Company.find({ 'eligibilityCriteria.requiredSkills': { $exists: true } }).lean().exec();
  console.log('Total companies with requiredSkills:', comps.length);
  if(comps.length > 0) {
    console.log('Sample skills:', comps[0].eligibilityCriteria.requiredSkills);
  }
  mongoose.disconnect();
}
test();
