require('dotenv').config();
const mongoose = require('mongoose');
async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Company = mongoose.model('Company', new mongoose.Schema({}, { strict: false }));
  const comp = await Company.findById('6a5679aff5631b6c01818dc2');
  console.log('Company found:', comp ? comp.name : 'NO');
  mongoose.disconnect();
}
test();
