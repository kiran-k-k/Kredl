const mongoose = require('mongoose');
const { Schema } = mongoose;

async function verifyAll() {
  await mongoose.connect('mongodb+srv://kendrek57_db_user:KttPcEKuLzF465JD@kredl-cluster.q6tycv2.mongodb.net/kredl?retryWrites=true&w=majority&appName=kredl-cluster');
  
  const UserSchema = new Schema({}, { strict: false, collection: 'users' });
  const UserModel = mongoose.model('User', UserSchema);
  
  const result = await UserModel.updateMany(
    { status: 'PENDING_VERIFICATION' },
    { $set: { status: 'ACTIVE', isEmailVerified: true } }
  );
  
  console.log(`Verified ${result.modifiedCount} pending accounts!`);
  process.exit(0);
}
verifyAll();
